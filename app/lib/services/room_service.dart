import 'package:hive/hive.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/room.dart';

class RoomService {
  final SupabaseClient _client;
  final Box<dynamic> _roomBox;

  RoomService(this._client, this._roomBox);

  Future<Room> createRoom({
    required String name,
    required String authorName,
  }) async {
    final res = await _client.functions.invoke('create_room', body: {
      'name': name,
      'author_name': authorName,
    });
    final room = Room.fromJson(res.data as Map<String, dynamic>);
    await _persistRoom(room, authorName);
    return room;
  }

  Future<Room> joinRoom({
    required String accessCode,
    required String authorName,
  }) async {
    final data = await _client
        .from('rooms')
        .select()
        .eq('access_code', accessCode)
        .eq('is_active', true)
        .single();
    final room = Room.fromJson(data);
    await _persistRoom(room, authorName);
    return room;
  }

  Future<void> _persistRoom(Room room, String authorName) async {
    await _roomBox.putAll({
      'roomId': room.id,
      'accessCode': room.accessCode,
      'authorName': authorName,
    });
  }

  String? get roomId => _roomBox.get('roomId');
  String? get authorName => _roomBox.get('authorName');
  String? get accessCode => _roomBox.get('accessCode');

  Future<void> leaveRoom() async {
    await _roomBox.clear();
  }
}
