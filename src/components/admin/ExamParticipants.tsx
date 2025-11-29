'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Users, RotateCcw, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  hasSubmitted: boolean;
  score: number | null;
  submittedAt: string | null;
}

interface ExamParticipantsProps {
  examId: string;
  participants: Participant[];
  onRefresh: () => void;
}

export default function ExamParticipants({ examId, participants, onRefresh }: ExamParticipantsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetAll, setShowResetAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(participants.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleResetSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal 1 peserta untuk direset');
      return;
    }

    const confirmed = confirm(
      `Apakah Anda yakin ingin mereset ujian untuk ${selectedIds.length} peserta terpilih?\n\nHasil ujian mereka akan dihapus dan mereka dapat mengerjakan ujian kembali.`
    );

    if (!confirmed) return;

    setIsResetting(true);
    try {
      const response = await fetch(`/api/admin/exams/${examId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantIds: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mereset ujian');
      }

      toast.success(data.message);
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mereset ujian peserta terpilih';
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetAll = async () => {
    const confirmed = confirm(
      `⚠️ PERINGATAN!\n\nApakah Anda yakin ingin mereset SEMUA hasil ujian?\n\nSemua peserta (${participants.length} orang) akan dapat mengerjakan ujian kembali.\n\nTindakan ini tidak dapat dibatalkan!`
    );

    if (!confirmed) return;

    // Konfirmasi kedua untuk keamanan
    const doubleConfirm = confirm('Konfirmasi sekali lagi:\nYa, saya yakin ingin mereset SEMUA hasil ujian');

    if (!doubleConfirm) return;

    setIsResetting(true);
    try {
      const response = await fetch(`/api/admin/exams/${examId}/reset`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mereset ujian');
      }

      toast.success(data.message);
      setSelectedIds([]);
      setShowResetAll(false);
      onRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mereset semua hasil ujian';
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  const submittedCount = participants.filter((p) => p.hasSubmitted).length;
  const notSubmittedCount = participants.length - submittedCount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Daftar Peserta Ujian</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{participants.length} peserta terdaftar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleResetSelected}
                disabled={isResetting}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset Terpilih</span> ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => setShowResetAll(!showResetAll)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Semua</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Sudah mengerjakan: <span className="font-semibold text-gray-900 dark:text-white">{submittedCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Belum mengerjakan: <span className="font-semibold text-gray-900 dark:text-white">{notSubmittedCount}</span>
            </span>
          </div>
        </div>

        {/* Reset All Confirmation */}
        {showResetAll && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">Anda yakin ingin mereset semua hasil ujian?</p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Semua {participants.length} peserta akan dapat mengerjakan ujian kembali. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAll}
                    disabled={isResetting}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResetting ? 'Mereset...' : 'Ya, Reset Semua'}
                  </button>
                  <button
                    onClick={() => setShowResetAll(false)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === participants.length && participants.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Email
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nilai</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Waktu Submit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 sm:px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(participant.id)}
                    onChange={(e) => handleSelect(participant.id, e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{participant.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{participant.email}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{participant.email}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  {participant.hasSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      <Clock className="w-3.5 h-3.5" />
                      Belum
                    </span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {participant.score !== null ? `${participant.score}` : '-'}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {participant.submittedAt
                      ? new Date(participant.submittedAt).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {participants.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada peserta terdaftar</p>
        </div>
      )}
    </div>
  );
}
