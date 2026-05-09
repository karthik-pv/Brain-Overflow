import 'package:freezed_annotation/freezed_annotation.dart';

part 'room_config.freezed.dart';
part 'room_config.g.dart';

@freezed
class RoomConfig with _$RoomConfig {
  const factory RoomConfig({
    required String roomId,
    required String selectedModelId,
    required DateTime updatedAt,
  }) = _RoomConfig;

  factory RoomConfig.fromJson(Map<String, dynamic> json) =>
      _$RoomConfigFromJson(json);
}
