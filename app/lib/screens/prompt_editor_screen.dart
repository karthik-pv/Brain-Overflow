import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/prompts_provider.dart';
import '../services/prompt_service.dart';
import '../services/room_service.dart';
import 'package:hive/hive.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PromptEditorScreen extends ConsumerStatefulWidget {
  const PromptEditorScreen({super.key});

  @override
  ConsumerState<PromptEditorScreen> createState() => _PromptEditorScreenState();
}

class _PromptEditorScreenState extends ConsumerState<PromptEditorScreen> {
  final Map<String, TextEditingController> _displayNameControllers = {};
  final Map<String, TextEditingController> _systemPromptControllers = {};

  @override
  void dispose() {
    for (final controller in _displayNameControllers.values) {
      controller.dispose();
    }
    for (final controller in _systemPromptControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  TextEditingController _getDisplayNameController(
      String promptId, String text) {
    if (!_displayNameControllers.containsKey(promptId)) {
      _displayNameControllers[promptId] = TextEditingController(text: text);
    }
    return _displayNameControllers[promptId]!;
  }

  TextEditingController _getSystemPromptController(
      String promptId, String text) {
    if (!_systemPromptControllers.containsKey(promptId)) {
      _systemPromptControllers[promptId] = TextEditingController(text: text);
    }
    return _systemPromptControllers[promptId]!;
  }

  @override
  Widget build(BuildContext context) {
    final promptsAsync = ref.watch(promptsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Prompts')),
      body: promptsAsync.when(
        data: (prompts) {
          return ReorderableListView.builder(
            itemCount: prompts.length,
            onReorder: (oldIndex, newIndex) {
              if (newIndex > oldIndex) newIndex--;
              // TODO: Implement reorder by updating execution_order
            },
            itemBuilder: (context, index) {
              final prompt = prompts[index];
              return ExpansionTile(
                key: ValueKey(prompt.id),
                title: Text(prompt.displayName),
                subtitle: Text('Order: ${prompt.executionOrder}'),
                trailing: Switch(
                  value: prompt.isEnabled,
                  onChanged: (value) async {
                    final client = Supabase.instance.client;
                    final roomService = RoomService(client, Hive.box('room'));
                    final promptService = PromptService(client, roomService);
                    await promptService.updatePrompt(
                      prompt.copyWith(isEnabled: value),
                    );
                    ref.invalidate(promptsProvider);
                  },
                ),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextField(
                          controller: _getDisplayNameController(
                              prompt.id, prompt.displayName),
                          decoration:
                              const InputDecoration(labelText: 'Display Name'),
                          onSubmitted: (value) async {
                            final client = Supabase.instance.client;
                            final roomService =
                                RoomService(client, Hive.box('room'));
                            final promptService =
                                PromptService(client, roomService);
                            await promptService.updatePrompt(
                              prompt.copyWith(displayName: value),
                            );
                            ref.invalidate(promptsProvider);
                          },
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _getSystemPromptController(
                              prompt.id, prompt.systemPrompt),
                          decoration:
                              const InputDecoration(labelText: 'System Prompt'),
                          maxLines: 5,
                          onSubmitted: (value) async {
                            final client = Supabase.instance.client;
                            final roomService =
                                RoomService(client, Hive.box('room'));
                            final promptService =
                                PromptService(client, roomService);
                            await promptService.updatePrompt(
                              prompt.copyWith(systemPrompt: value),
                            );
                            ref.invalidate(promptsProvider);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new prompt logic
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
