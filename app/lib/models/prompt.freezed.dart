// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'prompt.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Prompt _$PromptFromJson(Map<String, dynamic> json) {
  return _Prompt.fromJson(json);
}

/// @nodoc
mixin _$Prompt {
  String get id => throw _privateConstructorUsedError;
  String get roomId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  String get systemPrompt => throw _privateConstructorUsedError;
  int get executionOrder => throw _privateConstructorUsedError;
  bool get isEnabled => throw _privateConstructorUsedError;
  Map<String, dynamic> get responseSchema => throw _privateConstructorUsedError;
  bool get updatesMetadata => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $PromptCopyWith<Prompt> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PromptCopyWith<$Res> {
  factory $PromptCopyWith(Prompt value, $Res Function(Prompt) then) =
      _$PromptCopyWithImpl<$Res, Prompt>;
  @useResult
  $Res call(
      {String id,
      String roomId,
      String name,
      String displayName,
      String systemPrompt,
      int executionOrder,
      bool isEnabled,
      Map<String, dynamic> responseSchema,
      bool updatesMetadata,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$PromptCopyWithImpl<$Res, $Val extends Prompt>
    implements $PromptCopyWith<$Res> {
  _$PromptCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? name = null,
    Object? displayName = null,
    Object? systemPrompt = null,
    Object? executionOrder = null,
    Object? isEnabled = null,
    Object? responseSchema = null,
    Object? updatesMetadata = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      roomId: null == roomId
          ? _value.roomId
          : roomId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      displayName: null == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String,
      systemPrompt: null == systemPrompt
          ? _value.systemPrompt
          : systemPrompt // ignore: cast_nullable_to_non_nullable
              as String,
      executionOrder: null == executionOrder
          ? _value.executionOrder
          : executionOrder // ignore: cast_nullable_to_non_nullable
              as int,
      isEnabled: null == isEnabled
          ? _value.isEnabled
          : isEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      responseSchema: null == responseSchema
          ? _value.responseSchema
          : responseSchema // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      updatesMetadata: null == updatesMetadata
          ? _value.updatesMetadata
          : updatesMetadata // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PromptImplCopyWith<$Res> implements $PromptCopyWith<$Res> {
  factory _$$PromptImplCopyWith(
          _$PromptImpl value, $Res Function(_$PromptImpl) then) =
      __$$PromptImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String roomId,
      String name,
      String displayName,
      String systemPrompt,
      int executionOrder,
      bool isEnabled,
      Map<String, dynamic> responseSchema,
      bool updatesMetadata,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$PromptImplCopyWithImpl<$Res>
    extends _$PromptCopyWithImpl<$Res, _$PromptImpl>
    implements _$$PromptImplCopyWith<$Res> {
  __$$PromptImplCopyWithImpl(
      _$PromptImpl _value, $Res Function(_$PromptImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? name = null,
    Object? displayName = null,
    Object? systemPrompt = null,
    Object? executionOrder = null,
    Object? isEnabled = null,
    Object? responseSchema = null,
    Object? updatesMetadata = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$PromptImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      roomId: null == roomId
          ? _value.roomId
          : roomId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      displayName: null == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String,
      systemPrompt: null == systemPrompt
          ? _value.systemPrompt
          : systemPrompt // ignore: cast_nullable_to_non_nullable
              as String,
      executionOrder: null == executionOrder
          ? _value.executionOrder
          : executionOrder // ignore: cast_nullable_to_non_nullable
              as int,
      isEnabled: null == isEnabled
          ? _value.isEnabled
          : isEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      responseSchema: null == responseSchema
          ? _value._responseSchema
          : responseSchema // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      updatesMetadata: null == updatesMetadata
          ? _value.updatesMetadata
          : updatesMetadata // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PromptImpl implements _Prompt {
  const _$PromptImpl(
      {required this.id,
      required this.roomId,
      required this.name,
      required this.displayName,
      required this.systemPrompt,
      this.executionOrder = 0,
      this.isEnabled = true,
      final Map<String, dynamic> responseSchema = const {},
      this.updatesMetadata = false,
      required this.createdAt,
      required this.updatedAt})
      : _responseSchema = responseSchema;

  factory _$PromptImpl.fromJson(Map<String, dynamic> json) =>
      _$$PromptImplFromJson(json);

  @override
  final String id;
  @override
  final String roomId;
  @override
  final String name;
  @override
  final String displayName;
  @override
  final String systemPrompt;
  @override
  @JsonKey()
  final int executionOrder;
  @override
  @JsonKey()
  final bool isEnabled;
  final Map<String, dynamic> _responseSchema;
  @override
  @JsonKey()
  Map<String, dynamic> get responseSchema {
    if (_responseSchema is EqualUnmodifiableMapView) return _responseSchema;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_responseSchema);
  }

  @override
  @JsonKey()
  final bool updatesMetadata;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Prompt(id: $id, roomId: $roomId, name: $name, displayName: $displayName, systemPrompt: $systemPrompt, executionOrder: $executionOrder, isEnabled: $isEnabled, responseSchema: $responseSchema, updatesMetadata: $updatesMetadata, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PromptImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.roomId, roomId) || other.roomId == roomId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.systemPrompt, systemPrompt) ||
                other.systemPrompt == systemPrompt) &&
            (identical(other.executionOrder, executionOrder) ||
                other.executionOrder == executionOrder) &&
            (identical(other.isEnabled, isEnabled) ||
                other.isEnabled == isEnabled) &&
            const DeepCollectionEquality()
                .equals(other._responseSchema, _responseSchema) &&
            (identical(other.updatesMetadata, updatesMetadata) ||
                other.updatesMetadata == updatesMetadata) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      roomId,
      name,
      displayName,
      systemPrompt,
      executionOrder,
      isEnabled,
      const DeepCollectionEquality().hash(_responseSchema),
      updatesMetadata,
      createdAt,
      updatedAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PromptImplCopyWith<_$PromptImpl> get copyWith =>
      __$$PromptImplCopyWithImpl<_$PromptImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PromptImplToJson(
      this,
    );
  }
}

abstract class _Prompt implements Prompt {
  const factory _Prompt(
      {required final String id,
      required final String roomId,
      required final String name,
      required final String displayName,
      required final String systemPrompt,
      final int executionOrder,
      final bool isEnabled,
      final Map<String, dynamic> responseSchema,
      final bool updatesMetadata,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$PromptImpl;

  factory _Prompt.fromJson(Map<String, dynamic> json) = _$PromptImpl.fromJson;

  @override
  String get id;
  @override
  String get roomId;
  @override
  String get name;
  @override
  String get displayName;
  @override
  String get systemPrompt;
  @override
  int get executionOrder;
  @override
  bool get isEnabled;
  @override
  Map<String, dynamic> get responseSchema;
  @override
  bool get updatesMetadata;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  @JsonKey(ignore: true)
  _$$PromptImplCopyWith<_$PromptImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
