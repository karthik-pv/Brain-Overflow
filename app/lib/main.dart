import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'models/pending_idea.dart';
import 'router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(PendingIdeaAdapter());
  await Hive.openBox('credentials');
  await Hive.openBox('room');
  await Hive.openBox<PendingIdea>('pending_ideas');

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
