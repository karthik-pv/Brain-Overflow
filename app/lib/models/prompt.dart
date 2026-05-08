import 'package:freezed_annotation/freezed_annotation.dart';

part 'prompt.freezed.dart';
part 'prompt.g.dart';

@freezed
class Prompt with _$Prompt {
  const factory Prompt({
    required String id,
    required String roomId,
    required String name,
    required String displayName,
    required String systemPrompt,
    @Default(0) int executionOrder,
    @Default(true) bool isEnabled,
    @Default({}) Map<String, dynamic> responseSchema,
    @Default(false) bool updatesMetadata,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Prompt;

  factory Prompt.fromJson(Map<String, dynamic> json) => _$PromptFromJson(json);
}
