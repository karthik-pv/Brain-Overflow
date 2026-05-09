import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseInitService {
  static Future<void> initialize(String url, String anonKey) async {
    await Supabase.initialize(url: url, anonKey: anonKey);
  }

  static Future<bool> testConnection(String url, String anonKey) async {
    try {
      final client = SupabaseClient(url, anonKey);
      await client.from('models').select('id').limit(1);
      return true;
    } catch (_) {
      return false;
    }
  }
}
