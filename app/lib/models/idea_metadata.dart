import 'package:freezed_annotation/freezed_annotation.dart';

part 'idea_metadata.freezed.dart';
part 'idea_metadata.g.dart';

@freezed
class IdeaMetadata with _$IdeaMetadata {
  const factory IdeaMetadata({
    required String ideaId,
    String? category,
    String? score,
    String? refinedIdea,
    @Default([]) List<String> keyFeatures,
    String? targetPersona,
    @Default({}) Map<String, dynamic> paulGrahamDetails,
    @Default({}) Map<String, dynamic> responses,
    required DateTime updatedAt,
  }) = _IdeaMetadata;

  factory IdeaMetadata.fromJson(Map<String, dynamic> json) =>
      _$IdeaMetadataFromJson(json);
}
