// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room_config.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RoomConfigImpl _$$RoomConfigImplFromJson(Map<String, dynamic> json) =>
    _$RoomConfigImpl(
      roomId: json['roomId'] as String,
      selectedModelId: json['selectedModelId'] as String,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$RoomConfigImplToJson(_$RoomConfigImpl instance) =>
    <String, dynamic>{
      'roomId': instance.roomId,
      'selectedModelId': instance.selectedModelId,
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
