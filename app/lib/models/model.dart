import 'package:freezed_annotation/freezed_annotation.dart';

part 'model.freezed.dart';
part 'model.g.dart';

@freezed
class AiModel with _$AiModel {
  const factory AiModel({
    required String id,
    @Default('fireworks') String provider,
    required String displayName,
    required String apiModelId,
    @Default(true) bool isActive,
    required DateTime createdAt,
  }) = _AiModel;

  factory AiModel.fromJson(Map<String, dynamic> json) =>
      _$AiModelFromJson(json);
}
