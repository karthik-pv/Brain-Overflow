// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AiModelImpl _$$AiModelImplFromJson(Map<String, dynamic> json) =>
    _$AiModelImpl(
      id: json['id'] as String,
      provider: json['provider'] as String? ?? 'fireworks',
      displayName: json['displayName'] as String,
      apiModelId: json['apiModelId'] as String,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$AiModelImplToJson(_$AiModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'provider': instance.provider,
      'displayName': instance.displayName,
      'apiModelId': instance.apiModelId,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
    };
