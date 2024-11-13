import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from "solid-markdown";

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [petInfo, setPetInfo] = createSignal({ type: '', characteristics: '' });
  const [generatedNames, setGeneratedNames] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [savedNames, setSavedNames] = createSignal([]);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const handleGenerateNames = async () => {
    if (loading()) return;
    setLoading(true);
    try {
      const prompt = `Suggest 5 unique names for a ${petInfo().type} that is ${petInfo().characteristics}. Provide the names in a JSON array with the key "names".`;
      const result = await createEvent('chatgpt_request', {
        prompt: prompt,
        response_type: 'json'
      });
      if (result && result.names) {
        setGeneratedNames(result.names);
      } else {
        console.error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error generating names:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedNames = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/getNames', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setSavedNames(data);
    } else {
      console.error('Error fetching saved names:', response.statusText);
    }
  };

  const saveName = async (name) => {
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveName', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        // Optionally, you may re-fetch saved names
        fetchSavedNames();
      } else {
        console.error('Error saving name');
      }
    } catch (error) {
      console.error('Error saving name:', error);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchSavedNames();
  });

  return (
    <div class="h-full bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center h-full">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-green-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-green-600 cursor-pointer">Name My Pet</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 class="text-2xl font-bold mb-4 text-green-600">Tell us about your pet</h2>
              <div class="space-y-4">
                <input
                  type="text"
                  placeholder="Type of pet (e.g., dog, cat, bird)"
                  value={petInfo().type}
                  onInput={(e) => setPetInfo({ ...petInfo(), type: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                />
                <input
                  type="text"
                  placeholder="Characteristics (e.g., playful, brown, small)"
                  value={petInfo().characteristics}
                  onInput={(e) => setPetInfo({ ...petInfo(), characteristics: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                />
                <button
                  onClick={handleGenerateNames}
                  class={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading()}
                >
                  {loading() ? 'Generating...' : 'Generate Names'}
                </button>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-bold mb-4 text-green-600">Generated Names</h2>
              <Show when={generatedNames().length > 0} fallback={<p class="text-gray-700">No names generated yet.</p>}>
                <div class="space-y-4">
                  <For each={generatedNames()}>
                    {(name) => (
                      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                        <p class="text-lg text-gray-800">{name}</p>
                        <button
                          onClick={() => saveName(name)}
                          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>

          <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4 text-green-600">Your Saved Names</h2>
            <Show when={savedNames().length > 0} fallback={<p class="text-gray-700">You haven't saved any names yet.</p>}>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={savedNames()}>
                  {(item) => (
                    <div class="bg-white p-4 rounded-lg shadow-md">
                      <p class="text-lg text-gray-800">{item.name}</p>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;