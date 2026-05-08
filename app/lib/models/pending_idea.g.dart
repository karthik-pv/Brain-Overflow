// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pending_idea.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class PendingIdeaAdapter extends TypeAdapter<PendingIdea> {
  @override
  final int typeId = 0;

  @override
  PendingIdea read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return PendingIdea(
      id: fields[0] as String,
      transcript: fields[1] as String,
      authorName: fields[2] as String,
      roomId: fields[3] as String,
      recordedAt: fields[4] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, PendingIdea obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.transcript)
      ..writeByte(2)
      ..write(obj.authorName)
      ..writeByte(3)
      ..write(obj.roomId)
      ..writeByte(4)
      ..write(obj.recordedAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PendingIdeaAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
