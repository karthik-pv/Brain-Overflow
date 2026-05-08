// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'idea.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Idea _$IdeaFromJson(Map<String, dynamic> json) {
  return _Idea.fromJson(json);
}

/// @nodoc
mixin _$Idea {
  String get id => throw _privateConstructorUsedError;
  String get roomId => throw _privateConstructorUsedError;
  String get authorName => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $IdeaCopyWith<Idea> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $IdeaCopyWith<$Res> {
  factory $IdeaCopyWith(Idea value, $Res Function(Idea) then) =
      _$IdeaCopyWithImpl<$Res, Idea>;
  @useResult
  $Res call(
      {String id,
      String roomId,
      String authorName,
      String status,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$IdeaCopyWithImpl<$Res, $Val extends Idea>
    implements $IdeaCopyWith<$Res> {
  _$IdeaCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? authorName = null,
    Object? status = null,
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
      authorName: null == authorName
          ? _value.authorName
          : authorName // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
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
abstract class _$$IdeaImplCopyWith<$Res> implements $IdeaCopyWith<$Res> {
  factory _$$IdeaImplCopyWith(
          _$IdeaImpl value, $Res Function(_$IdeaImpl) then) =
      __$$IdeaImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String roomId,
      String authorName,
      String status,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$IdeaImplCopyWithImpl<$Res>
    extends _$IdeaCopyWithImpl<$Res, _$IdeaImpl>
    implements _$$IdeaImplCopyWith<$Res> {
  __$$IdeaImplCopyWithImpl(_$IdeaImpl _value, $Res Function(_$IdeaImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? authorName = null,
    Object? status = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$IdeaImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      roomId: null == roomId
          ? _value.roomId
          : roomId // ignore: cast_nullable_to_non_nullable
              as String,
      authorName: null == authorName
          ? _value.authorName
          : authorName // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
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
class _$IdeaImpl implements _Idea {
  const _$IdeaImpl(
      {required this.id,
      required this.roomId,
      required this.authorName,
      this.status = 'recorded',
      required this.createdAt,
      required this.updatedAt});

  factory _$IdeaImpl.fromJson(Map<String, dynamic> json) =>
      _$$IdeaImplFromJson(json);

  @override
  final String id;
  @override
  final String roomId;
  @override
  final String authorName;
  @override
  @JsonKey()
  final String status;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Idea(id: $id, roomId: $roomId, authorName: $authorName, status: $status, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$IdeaImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.roomId, roomId) || other.roomId == roomId) &&
            (identical(other.authorName, authorName) ||
                other.authorName == authorName) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, roomId, authorName, status, createdAt, updatedAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$IdeaImplCopyWith<_$IdeaImpl> get copyWith =>
      __$$IdeaImplCopyWithImpl<_$IdeaImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$IdeaImplToJson(
      this,
    );
  }
}

abstract class _Idea implements Idea {
  const factory _Idea(
      {required final String id,
      required final String roomId,
      required final String authorName,
      final String status,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$IdeaImpl;

  factory _Idea.fromJson(Map<String, dynamic> json) = _$IdeaImpl.fromJson;

  @override
  String get id;
  @override
  String get roomId;
  @override
  String get authorName;
  @override
  String get status;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  @JsonKey(ignore: true)
  _$$IdeaImplCopyWith<_$IdeaImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
