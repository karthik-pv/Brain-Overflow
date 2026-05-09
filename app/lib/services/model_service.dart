import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/model.dart';

class ModelService {
  final SupabaseClient _client;

  ModelService(this._client);

  Future<List<AiModel>> fetchModels() async {
    final data = await _client.from('models').select().order('created_at');
    return data.map((d) => AiModel.fromJson(d)).toList();
  }

  Future<void> updateModel(AiModel model) async {
    await _client.from('models').update({
      'provider': model.provider,
      'display_name': model.displayName,
      'api_model_id': model.apiModelId,
      'is_active': model.isActive,
    }).eq('id', model.id);
  }

  Future<void> createModel(AiModel model) async {
    await _client.from('models').insert({
      'id': model.id,
      'provider': model.provider,
      'display_name': model.displayName,
      'api_model_id': model.apiModelId,
      'is_active': model.isActive,
    });
  }

  Future<void> setRoomModel(String roomId, String modelId) async {
    await _client.from('room_config').upsert({
      'room_id': roomId,
      'selected_model_id': modelId,
      'updated_at': DateTime.now().toIso8601String(),
    });
  }
}
