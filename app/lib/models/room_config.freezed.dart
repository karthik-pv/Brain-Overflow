// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'room_config.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RoomConfig _$RoomConfigFromJson(Map<String, dynamic> json) {
  return _RoomConfig.fromJson(json);
}

/// @nodoc
mixin _$RoomConfig {
  String get roomId => throw _privateConstructorUsedError;
  String get selectedModelId => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $RoomConfigCopyWith<RoomConfig> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RoomConfigCopyWith<$Res> {
  factory $RoomConfigCopyWith(
          RoomConfig value, $Res Function(RoomConfig) then) =
      _$RoomConfigCopyWithImpl<$Res, RoomConfig>;
  @useResult
  $Res call({String roomId, String selectedModelId, DateTime updatedAt});
}

/// @nodoc
class _$RoomConfigCopyWithImpl<$Res, $Val extends RoomConfig>
    implements $RoomConfigCopyWith<$Res> {
  _$RoomConfigCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? roomId = null,
    Object? selectedModelId = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      roomId: null == roomId
          ? _value.roomId
          : roomId // ignore: cast_nullable_to_non_nullable
              as String,
      selectedModelId: null == selectedModelId
          ? _value.selectedModelId
          : selectedModelId // ignore: cast_nullable_to_non_nullable
              as String,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RoomConfigImplCopyWith<$Res>
    implements $RoomConfigCopyWith<$Res> {
  factory _$$RoomConfigImplCopyWith(
          _$RoomConfigImpl value, $Res Function(_$RoomConfigImpl) then) =
      __$$RoomConfigImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String roomId, String selectedModelId, DateTime updatedAt});
}

/// @nodoc
class __$$RoomConfigImplCopyWithImpl<$Res>
    extends _$RoomConfigCopyWithImpl<$Res, _$RoomConfigImpl>
    implements _$$RoomConfigImplCopyWith<$Res> {
  __$$RoomConfigImplCopyWithImpl(
      _$RoomConfigImpl _value, $Res Function(_$RoomConfigImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? roomId = null,
    Object? selectedModelId = null,
    Object? updatedAt = null,
  }) {
    return _then(_$RoomConfigImpl(
      roomId: null == roomId
          ? _value.roomId
          : roomId // ignore: cast_nullable_to_non_nullable
              as String,
      selectedModelId: null == selectedModelId
          ? _value.selectedModelId
          : selectedModelId // ignore: cast_nullable_to_non_nullable
              as String,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RoomConfigImpl implements _RoomConfig {
  const _$RoomConfigImpl(
      {required this.roomId,
      required this.selectedModelId,
      required this.updatedAt});

  factory _$RoomConfigImpl.fromJson(Map<String, dynamic> json) =>
      _$$RoomConfigImplFromJson(json);

  @override
  final String roomId;
  @override
  final String selectedModelId;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'RoomConfig(roomId: $roomId, selectedModelId: $selectedModelId, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RoomConfigImpl &&
            (identical(other.roomId, roomId) || other.roomId == roomId) &&
            (identical(other.selectedModelId, selectedModelId) ||
                other.selectedModelId == selectedModelId) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode =>
      Object.hash(runtimeType, roomId, selectedModelId, updatedAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$RoomConfigImplCopyWith<_$RoomConfigImpl> get copyWith =>
      __$$RoomConfigImplCopyWithImpl<_$RoomConfigImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RoomConfigImplToJson(
      this,
    );
  }
}

abstract class _RoomConfig implements RoomConfig {
  const factory _RoomConfig(
      {required final String roomId,
      required final String selectedModelId,
      required final DateTime updatedAt}) = _$RoomConfigImpl;

  factory _RoomConfig.fromJson(Map<String, dynamic> json) =
      _$RoomConfigImpl.fromJson;

  @override
  String get roomId;
  @override
  String get selectedModelId;
  @override
  DateTime get updatedAt;
  @override
  @JsonKey(ignore: true)
  _$$RoomConfigImplCopyWith<_$RoomConfigImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
