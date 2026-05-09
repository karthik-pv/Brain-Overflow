import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'models/pending_idea.dart';
import 'router.dart';
import 'services/offline_queue_service.dart';
import 'services/idea_service.dart';
import 'services/room_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(PendingIdeaAdapter());
  await Hive.openBox('credentials');
  await Hive.openBox('room');
  await Hive.openBox<PendingIdea>('pending_ideas');

  final offlineQueue = OfflineQueueService();
  await offlineQueue.init();

  Connectivity()
      .onConnectivityChanged
      .listen((List<ConnectivityResult> results) {
    final isOnline = results.any((r) => r != ConnectivityResult.none);
    if (isOnline && offlineQueue.pending.isNotEmpty) {
      try {
        final client = Supabase.instance.client;
        final roomService = RoomService(client, Hive.box('room'));
        final ideaService = IdeaService(client, roomService, offlineQueue);
        offlineQueue.syncAll(ideaService);
      } catch (_) {
        // Supabase not initialized yet, will retry on next connectivity event
      }
    }
  });

  runApp(
    const ProviderScope(
      child: BrainOverflowApp(),
    ),
  );
}

class BrainOverflowApp extends ConsumerWidget {
  const BrainOverflowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Brain Overflow',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
