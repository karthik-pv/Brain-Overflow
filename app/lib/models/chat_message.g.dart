// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChatMessageImpl _$$ChatMessageImplFromJson(Map<String, dynamic> json) =>
    _$ChatMessageImpl(
      id: json['id'] as String,
      ideaId: json['ideaId'] as String,
      roomId: json['roomId'] as String,
      role: json['role'] as String,
      content: json['content'] as String,
      promptId: json['promptId'] as String?,
      modelId: json['modelId'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>? ?? const {},
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$ChatMessageImplToJson(_$ChatMessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'ideaId': instance.ideaId,
      'roomId': instance.roomId,
      'role': instance.role,
      'content': instance.content,
      'promptId': instance.promptId,
      'modelId': instance.modelId,
      'metadata': instance.metadata,
      'createdAt': instance.createdAt.toIso8601String(),
    };
