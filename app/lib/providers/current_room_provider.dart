import 'package:hive/hive.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'current_room_provider.g.dart';

@riverpod
class CurrentRoom extends _$CurrentRoom {
  @override
  ({String? roomId, String? accessCode, String? authorName}) build() {
    final box = Hive.box('room');
    return (
      roomId: box.get('roomId') as String?,
      accessCode: box.get('accessCode') as String?,
      authorName: box.get('authorName') as String?,
    );
  }

  Future<void> clear() async {
    await Hive.box('room').clear();
    state = (roomId: null, accessCode: null, authorName: null);
  }
}
