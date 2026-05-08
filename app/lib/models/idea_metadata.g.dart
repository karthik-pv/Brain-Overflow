// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'idea_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$IdeaMetadataImpl _$$IdeaMetadataImplFromJson(Map<String, dynamic> json) =>
    _$IdeaMetadataImpl(
      ideaId: json['ideaId'] as String,
      category: json['category'] as String?,
      score: json['score'] as String?,
      refinedIdea: json['refinedIdea'] as String?,
      keyFeatures: (json['keyFeatures'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      targetPersona: json['targetPersona'] as String?,
      paulGrahamDetails:
          json['paulGrahamDetails'] as Map<String, dynamic>? ?? const {},
      responses: json['responses'] as Map<String, dynamic>? ?? const {},
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$IdeaMetadataImplToJson(_$IdeaMetadataImpl instance) =>
    <String, dynamic>{
      'ideaId': instance.ideaId,
      'category': instance.category,
      'score': instance.score,
      'refinedIdea': instance.refinedIdea,
      'keyFeatures': instance.keyFeatures,
      'targetPersona': instance.targetPersona,
      'paulGrahamDetails': instance.paulGrahamDetails,
      'responses': instance.responses,
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
