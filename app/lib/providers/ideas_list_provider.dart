import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/idea.dart';
import '../services/idea_service.dart';
import '../services/room_service.dart';
import 'package:hive/hive.dart';

part 'ideas_list_provider.g.dart';

@riverpod
Stream<List<Idea>> ideasList(IdeasListRef ref) {
  final client = Supabase.instance.client;
  final roomService = RoomService(client, Hive.box('room'));
  final ideaService = IdeaService(client, roomService);
  return ideaService.watchIdeas();
}
