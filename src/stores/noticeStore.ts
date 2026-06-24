import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NoticeResponse } from '@/types/domain';
import { getCurrentUser } from '@/lib/mockAuth';

type NoticeState = {
  /** 응답 이력 (누적, 덮어쓰지 않음) — PRD F-GUIDE-4/7 */
  responses: NoticeResponse[];
  /** 현재 사용자의 최신 응답 */
  latestForCurrentUser: () => NoticeResponse | undefined;
  /** 현재 사용자가 한 번이라도 응답했는지 (라우트 가드) */
  hasResponded: () => boolean;
  /** 새 응답을 행으로 추가 */
  respond: (ownership: 'has' | 'none') => NoticeResponse;
  /** [DEV] 샘플 이력 채우기 / 초기화 */
  seedDevSamples: () => void;
  resetForDev: () => void;
};

export const useNoticeStore = create<NoticeState>()(
  persist(
    (set, get) => ({
      responses: [],
      latestForCurrentUser: () => {
        const me = getCurrentUser();
        return get()
          .responses.filter((r) => r.empNo === me.empNo)
          .at(-1);
      },
      hasResponded: () => {
        const me = getCurrentUser();
        return get().responses.some((r) => r.empNo === me.empNo);
      },
      respond: (ownership) => {
        const me = getCurrentUser();
        const res: NoticeResponse = {
          responseId: crypto.randomUUID(),
          empNo: me.empNo,
          empName: me.empName,
          deptPath: me.deptPath,
          ownership,
          respondedAt: new Date().toISOString(),
        };
        set((s) => ({ responses: [...s.responses, res] }));
        return res;
      },
      seedDevSamples: () => {
        const me = getCurrentUser();
        const mk = (ownership: 'has' | 'none', daysAgo: number): NoticeResponse => ({
          responseId: crypto.randomUUID(),
          empNo: me.empNo,
          empName: me.empName,
          deptPath: me.deptPath,
          ownership,
          respondedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
        });
        set({ responses: [mk('none', 3), mk('has', 1)] });
      },
      resetForDev: () => set({ responses: [] }),
    }),
    { name: 'acv2-notice' },
  ),
);
