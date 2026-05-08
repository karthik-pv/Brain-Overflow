// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'idea.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$IdeaImpl _$$IdeaImplFromJson(Map<String, dynamic> json) => _$IdeaImpl(
      id: json['id'] as String,
      roomId: json['roomId'] as String,
      authorName: json['authorName'] as String,
      status: json['status'] as String? ?? 'recorded',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$IdeaImplToJson(_$IdeaImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'roomId': instance.roomId,
      'authorName': instance.authorName,
      'status': instance.status,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
