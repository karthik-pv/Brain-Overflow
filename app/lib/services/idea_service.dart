import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import '../models/idea.dart';
import 'room_service.dart';

class IdeaService {
  final SupabaseClient _client;
  final RoomService _roomService;

  IdeaService(this._client, this._roomService);

  Future<String> createIdea(String transcript) async {
    final roomId = _roomService.roomId!;
    final author = _roomService.authorName!;
    final ideaId = const Uuid().v4();

    try {
      await createIdeaDirect(
        ideaId: ideaId,
        roomId: roomId,
        author: author,
        transcript: transcript,
      );
      return ideaId;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createIdeaDirect({
    required String ideaId,
    required String roomId,
    required String author,
    required String transcript,
  }) async {
    await _client.from('ideas').insert({
      'id': ideaId,
      'room_id': roomId,
      'author_name': author,
      'status': 'recorded',
    });
    await _client.from('chat_messages').insert({
      'idea_id': ideaId,
      'room_id': roomId,
      'role': 'user',
      'content': transcript,
    });
    await _client.functions.invoke('process_idea', body: {
      'room_id': roomId,
      'idea_id': ideaId,
      'author_name': author,
      'transcript': transcript,
    });
  }

  Stream<List<Idea>> watchIdeas() {
    final roomId = _roomService.roomId;
    if (roomId == null) return const Stream.empty();
    return _client
        .from('ideas')
        .stream(primaryKey: ['id'])
        .eq('room_id', roomId)
        .order('created_at', ascending: false)
        .map((rows) => rows.map((r) => Idea.fromJson(r)).toList());
  }

  Future<List<Map<String, dynamic>>> fetchIdeasWithMetadata() async {
    final roomId = _roomService.roomId!;
    return await _client
        .from('ideas')
        .select('*, idea_metadata(*)')
        .eq('room_id', roomId)
        .order('created_at', ascending: false);
  }
}
