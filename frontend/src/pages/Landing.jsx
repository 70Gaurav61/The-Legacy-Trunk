import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiUsers, FiClock, FiLock, FiUpload } from "react-icons/fi";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <header className="max-w-6xl mx-auto px-6 py-6">
        {/* Header intentionally left minimal: branding and auth are in the global navigation */}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <section className="space-y-6">
          <div className="text-sm uppercase text-indigo-500 font-semibold tracking-wider">Welcome to Legacy Trunk</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">Preserve memories, protect your family's legacy.</h1>

          <p className="text-gray-600 text-lg">Legacy Trunk is a secure, collaborative platform for families to store stories, photos, documents, and timelines. Build an interactive family tree, tag loved ones, and schedule time-capsules — all with privacy and vault-level security.</p>

          <div className="flex items-center gap-4">
            <Link to="/auth/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5">
              Get Started
            </Link>
            <Link to="/auth/login" className="inline-flex items-center gap-2 text-indigo-600 px-4 py-3 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">Already have an account</Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><FiShield size={22} /></div>
              <div>
                <h4 className="font-semibold text-lg">Security First</h4>
                <p className="text-sm text-gray-600 mt-2">All sensitive files and vault items are stored with strong encryption and access controls. You decide who can view or download documents; vault items can be locked with additional credentials and audited for access history. We provide optional recovery methods and export tools so families keep control over their data.</p>
                <ul className="mt-3 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>End-to-end style encryption for vault contents.</li>
                  <li>Role-based access: owner, collaborator, viewer.</li>
                  <li>Audit logs and download controls for sensitive items.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><FiUsers size={22} /></div>
              <div>
                <h4 className="font-semibold text-lg">Interactive Family Tree</h4>
                <p className="text-sm text-gray-600 mt-2">Build relationships with an interactive visual tree. Add people, link parents and children, and invite relatives to claim their profiles. Unclaimed persons remain as family placeholders and show tagged posts but are not editable until claimed.</p>
                <p className="text-sm text-gray-600 mt-2">The tree view supports searching, zoom, and focus-on-member actions so large families are easy to navigate.</p>
                <ul className="mt-3 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Claim codes for secure onboarding of relatives.</li>
                  <li>Quick jumps from a person to their profile and tagged memories.</li>
                  <li>Export tree data for backups and sharing.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><FiUpload size={22} /></div>
              <div>
                <h4 className="font-semibold text-lg">Media & Versioning</h4>
                <p className="text-sm text-gray-600 mt-2">Upload photos, videos, and documents with smart organization. Each memory can hold multiple versions so edits or restorative changes never overwrite originals. Thumbnails and previews are generated automatically for fast browsing.</p>
                <p className="text-sm text-gray-600 mt-2">Version history lets you review and restore previous iterations of a memory item.</p>
                <ul className="mt-3 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Automatic thumbnails and adaptive streaming for videos.</li>
                  <li>Version history with restore and diff notes.</li>
                  <li>Storage controls to manage quality and retention.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600"><FiClock size={22} /></div>
              <div>
                <h4 className="font-semibold text-lg">Time Capsules & Scheduled Delivery</h4>
                <p className="text-sm text-gray-600 mt-2">Create messages, collections, or media bundles that will be delivered at a future date. Time capsules are useful for birthdays, anniversaries, or passing messages to future generations. Deliveries can be conditional (e.g., when a family member claims a profile) or scheduled by date and timezone.</p>
                <ul className="mt-3 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Flexible scheduling with repeat or single delivery.</li>
                  <li>Preview recipients and content before scheduling.</li>
                  <li>Manual or automated release with audit trail.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold">Collaboration, Privacy & Portability</h3>
            <p className="text-sm text-gray-600 mt-3">Invite collaborators with fine-grained permissions: contributors can add memories and edit non-sensitive fields, while viewers see published content only. Privacy is central — families control sharing links, download rights, and vault access. When needed, export timelines, media, and tree data in common formats for offline archives.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">Permissions</div>
                <div className="text-sm text-gray-500 mt-1">Granular roles and temporary links.</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">Backups</div>
                <div className="text-sm text-gray-500 mt-1">Export and scheduled backups for peace of mind.</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">Privacy</div>
                <div className="text-sm text-gray-500 mt-1">Opt-in sharing, controlled downloads, and audit logs.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 p-8 shadow-2xl text-white transform-gpu animate-fadeIn" style={{ minHeight: 420 }}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">LT</div>
              <div>
                <h3 className="text-2xl font-bold">Welcome, families.</h3>
                <p className="text-sm opacity-90 mt-1">A safe place to collect memories, pass stories, and protect what matters.</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-sm font-semibold">Private Vault</div>
                <div className="text-xs mt-1 opacity-90">Lock away sensitive documents with optional password protection.</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-sm font-semibold">Tag & Connect</div>
                <div className="text-xs mt-1 opacity-90">Associate memories with family members for richer stories.</div>
              </div>
            </div>

            <div className="mt-8">
              <div className="h-36 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="w-48 h-20 bg-white/30 rounded-md animate-[pulse_2.5s_infinite]" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/auth/signup" className="bg-white/20 px-4 py-2 rounded-md hover:bg-white/30 transition">Create family</Link>
              <Link to="/auth/login" className="bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 transition">See demo</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">Made with ❤️ for families — Legacy Trunk.</div>
      </footer>
    </div>
  );
}
