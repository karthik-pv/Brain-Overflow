import 'package:hive/hive.dart';

part 'pending_idea.g.dart';

@HiveType(typeId: 0)
class PendingIdea extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String transcript;

  @HiveField(2)
  final String authorName;

  @HiveField(3)
  final String roomId;

  @HiveField(4)
  final DateTime recordedAt;

  PendingIdea({
    required this.id,
    required this.transcript,
    required this.authorName,
    required this.roomId,
    required this.recordedAt,
  });
}
