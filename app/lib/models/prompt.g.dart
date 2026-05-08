// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'prompt.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PromptImpl _$$PromptImplFromJson(Map<String, dynamic> json) => _$PromptImpl(
      id: json['id'] as String,
      roomId: json['roomId'] as String,
      name: json['name'] as String,
      displayName: json['displayName'] as String,
      systemPrompt: json['systemPrompt'] as String,
      executionOrder: (json['executionOrder'] as num?)?.toInt() ?? 0,
      isEnabled: json['isEnabled'] as bool? ?? true,
      responseSchema:
          json['responseSchema'] as Map<String, dynamic>? ?? const {},
      updatesMetadata: json['updatesMetadata'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$PromptImplToJson(_$PromptImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'roomId': instance.roomId,
      'name': instance.name,
      'displayName': instance.displayName,
      'systemPrompt': instance.systemPrompt,
      'executionOrder': instance.executionOrder,
      'isEnabled': instance.isEnabled,
      'responseSchema': instance.responseSchema,
      'updatesMetadata': instance.updatesMetadata,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
