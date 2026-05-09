import 'package:hive/hive.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_credentials_provider.g.dart';

@riverpod
class AuthCredentials extends _$AuthCredentials {
  @override
  ({String? url, String? anonKey}) build() {
    final box = Hive.box('credentials');
    return (
      url: box.get('supabaseUrl') as String?,
      anonKey: box.get('supabaseAnonKey') as String?,
    );
  }

  Future<void> save(String url, String anonKey) async {
    final box = Hive.box('credentials');
    await box.put('supabaseUrl', url);
    await box.put('supabaseAnonKey', anonKey);
    state = (url: url, anonKey: anonKey);
  }
}
