import { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LANGUAGES } from '@/utils/constants';
import type { Language } from '@/types/homework';

export function SettingsPage() {
  // Mock user settings
  const [settings, setSettings] = useState({
    default_input_language: 'en' as Language,
    default_output_language: 'en' as Language,
    auto_generate_audio: true,
    audio_speed: 1.0,
    theme: 'light' as 'light' | 'dark' | 'system',
    notifications_enabled: true,
    study_reminders: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Language Preferences</CardTitle>
            <CardDescription>
              Set default languages for input and output
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Input Language
              </label>
              <select
                value={settings.default_input_language}
                onChange={(e) => setSettings({ ...settings, default_input_language: e.target.value as Language })}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Output Language
              </label>
              <select
                value={settings.default_output_language}
                onChange={(e) => setSettings({ ...settings, default_output_language: e.target.value as Language })}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Settings</CardTitle>
            <CardDescription>
              Configure audio playback options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-generate Audio</p>
                <p className="text-sm text-gray-600">
                  Automatically create audio for solutions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_generate_audio}
                  onChange={(e) => setSettings({ ...settings, auto_generate_audio: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio Speed: {settings.audio_speed}x
              </label>
              <input
                type="range"
                min="0.75"
                max="2"
                step="0.25"
                value={settings.audio_speed}
                onChange={(e) => setSettings({ ...settings, audio_speed: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.75x</span>
                <span>1.0x</span>
                <span>1.25x</span>
                <span>1.5x</span>
                <span>2.0x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSettings({ ...settings, theme })}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      settings.theme === theme
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive updates and reminders
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Study Reminders</p>
                <p className="text-sm text-gray-600">
                  Get reminded to study daily
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.study_reminders}
                  onChange={(e) => setSettings({ ...settings, study_reminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave} disabled={isSaving}>
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
