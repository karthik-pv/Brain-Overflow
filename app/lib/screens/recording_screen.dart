import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hive/hive.dart';
import '../services/speech_service.dart';
import '../services/idea_service.dart';
import '../services/room_service.dart';
import '../services/offline_queue_service.dart';

class RecordingScreen extends ConsumerStatefulWidget {
  const RecordingScreen({super.key});

  @override
  ConsumerState<RecordingScreen> createState() => _RecordingScreenState();
}

class _RecordingScreenState extends ConsumerState<RecordingScreen>
    with SingleTickerProviderStateMixin {
  final _speechService = SpeechService();
  final _transcript = StringBuffer();
  StreamSubscription<String>? _speechSub;
  bool _isListening = false;
  bool _saving = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    final available = await _speechService.init();
    if (!available && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Speech recognition not available')),
      );
    }
  }

  void _startListening() {
    setState(() => _isListening = true);
    _speechSub = _speechService.listen().listen((words) {
      setState(() {
        _transcript.clear();
        _transcript.write(words);
      });
    });
  }

  Future<void> _stopListening() async {
    await _speechService.stop();
    await _speechSub?.cancel();
    setState(() => _isListening = false);
  }

  Future<void> _saveIdea() async {
    if (_transcript.isEmpty) return;
    setState(() => _saving = true);

    try {
      final client = Supabase.instance.client;
      final roomService = RoomService(client, Hive.box('room'));
      final offlineQueue = OfflineQueueService();
      await offlineQueue.init();
      final ideaService = IdeaService(client, roomService, offlineQueue);
      await ideaService.createIdea(_transcript.toString());
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Saved offline — will sync when connected'),
          ),
        );
        context.pop();
      }
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _speechSub?.cancel();
    _speechService.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Record Idea')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Center(
                child: GestureDetector(
                  onTap: _isListening ? _stopListening : _startListening,
                  child: AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 120 +
                            (_isListening ? _pulseController.value * 20 : 0),
                        height: 120 +
                            (_isListening ? _pulseController.value * 20 : 0),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isListening
                              ? Colors.red.withValues(
                                  alpha: 0.3 + _pulseController.value * 0.3)
                              : Colors.grey.withValues(alpha: 0.3),
                        ),
                        child: Icon(
                          _isListening ? Icons.mic : Icons.mic_none,
                          size: 48,
                          color: _isListening ? Colors.red : Colors.grey,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _transcript.isEmpty
                    ? 'Tap the mic to start speaking...'
                    : _transcript.toString(),
                style: const TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saving || _transcript.isEmpty ? null : _saveIdea,
              child: _saving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save Idea'),
            ),
          ],
        ),
      ),
    );
  }
}
