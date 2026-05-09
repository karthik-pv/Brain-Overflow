import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/chat_messages_provider.dart';
import '../providers/idea_detail_provider.dart';
import '../services/chat_service.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/typing_indicator.dart';
import '../widgets/score_badge.dart';
import '../widgets/category_badge.dart';

class IdeaDetailScreen extends ConsumerStatefulWidget {
  final String ideaId;

  const IdeaDetailScreen({super.key, required this.ideaId});

  @override
  ConsumerState<IdeaDetailScreen> createState() => _IdeaDetailScreenState();
}

class _IdeaDetailScreenState extends ConsumerState<IdeaDetailScreen> {
  final _scrollController = ScrollController();
  final _inputController = TextEditingController();
  bool _headerExpanded = true;
  bool _sending = false;

  @override
  void dispose() {
    _scrollController.dispose();
    _inputController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;
    _inputController.clear();
    setState(() => _sending = true);

    try {
      final roomId = Hive.box('room').get('roomId') as String?;
      if (roomId == null) return;

      final messages =
          ref.read(chatMessagesProvider(widget.ideaId)).valueOrNull ?? [];
      final chatService = ChatService(Supabase.instance.client);
      await chatService.sendUserMessage(
        ideaId: widget.ideaId,
        roomId: roomId,
        content: text,
        history: messages,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e')),
        );
      }
    } finally {
      setState(() => _sending = false);
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(chatMessagesProvider(widget.ideaId));
    final metadataAsync = ref.watch(ideaMetadataProvider(widget.ideaId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Idea Detail'),
        actions: [
          IconButton(
            icon: Icon(_headerExpanded ? Icons.expand_less : Icons.expand_more),
            onPressed: () => setState(() => _headerExpanded = !_headerExpanded),
          ),
        ],
      ),
      body: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: _headerExpanded ? null : 0,
            child: metadataAsync.when(
              data: (metadata) {
                if (metadata == null) return const SizedBox.shrink();
                return Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.grey.shade100,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CategoryBadge(category: metadata.category),
                          const SizedBox(width: 8),
                          ScoreBadge(score: metadata.score),
                        ],
                      ),
                      if (metadata.refinedIdea != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          metadata.refinedIdea!,
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ],
                      if (metadata.targetPersona != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Target: ${metadata.targetPersona}',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                      if (metadata.keyFeatures.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          children: metadata.keyFeatures
                              .map((f) => Chip(
                                    label: Text(f),
                                    padding: EdgeInsets.zero,
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ))
                              .toList(),
                        ),
                      ],
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
          Expanded(
            child: messagesAsync.when(
              data: (messages) {
                WidgetsBinding.instance
                    .addPostFrameCallback((_) => _scrollToBottom());
                return ListView.builder(
                  controller: _scrollController,
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    return ChatBubble(message: messages[index]);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
            ),
          ),
          // Typing indicator
          messagesAsync.when(
            data: (messages) {
              if (messages.isEmpty) return const SizedBox.shrink();
              final lastMessage = messages.last;
              final isProcessing = lastMessage.role == 'user';
              return isProcessing
                  ? const TypingIndicator()
                  : const SizedBox.shrink();
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          // Message input bar
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.shade300)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      decoration: const InputDecoration(
                        hintText: 'Type a reply...',
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: _sending
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                    onPressed: _sending ? null : _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
