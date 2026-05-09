import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/models_provider.dart';
import '../services/model_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ModelManagerScreen extends ConsumerWidget {
  const ModelManagerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final modelsAsync = ref.watch(modelsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('AI Models')),
      body: modelsAsync.when(
        data: (models) {
          return ListView.builder(
            itemCount: models.length,
            itemBuilder: (context, index) {
              final model = models[index];
              return ListTile(
                title: Text(model.displayName),
                subtitle: Text('${model.provider} • ${model.apiModelId}'),
                trailing: Switch(
                  value: model.isActive,
                  onChanged: (value) async {
                    final service = ModelService(Supabase.instance.client);
                    await service.updateModel(model.copyWith(isActive: value));
                    ref.invalidate(modelsProvider);
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add new model logic
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
