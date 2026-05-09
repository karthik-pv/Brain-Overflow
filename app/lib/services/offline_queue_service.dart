import 'package:hive/hive.dart';
import '../models/pending_idea.dart';
import 'idea_service.dart';

class OfflineQueueService {
  static final OfflineQueueService _instance = OfflineQueueService._internal();
  factory OfflineQueueService() => _instance;
  OfflineQueueService._internal();

  Box<PendingIdea>? _box;

  Future<void> init() async {
    _box ??= Hive.box<PendingIdea>('pending_ideas');
  }

  Box<PendingIdea> get _boxSync {
    if (_box == null) {
      throw StateError(
          'OfflineQueueService not initialized. Call init() first.');
    }
    return _box!;
  }

  Future<void> enqueue({
    required String ideaId,
    required String transcript,
    required String authorName,
    required String roomId,
  }) async {
    await _boxSync.put(
      ideaId,
      PendingIdea(
        id: ideaId,
        transcript: transcript,
        authorName: authorName,
        roomId: roomId,
        recordedAt: DateTime.now(),
      ),
    );
  }

  List<PendingIdea> get pending => _boxSync.values.toList();

  Future<void> syncAll(IdeaService ideaService) async {
    for (final item in List.of(pending)) {
      try {
        await ideaService.createIdeaDirect(
          ideaId: item.id,
          roomId: item.roomId,
          author: item.authorName,
          transcript: item.transcript,
        );
        await _boxSync.delete(item.id);
      } catch (_) {
        // Leave in queue for next connectivity event
      }
    }
  }
}
