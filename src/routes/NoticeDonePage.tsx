import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

/** 안내 완료 화면 ('보유 없음' 응답 후) — PRD §3.1. */
export default function NoticeDonePage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <CheckCircle2 size={48} className="mx-auto text-success" />
      <h1 className="mt-4 text-xl font-bold text-neutral-900">확인해 주셔서 감사합니다</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        추후 자산이 생기면 언제든 본 페이지에서 응답해 주세요.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={() => navigate('/notice')}>안내로 돌아가기</Button>
        <Button variant="primary" onClick={() => navigate('/search')}>
          자산 검색하기
        </Button>
      </div>
    </div>
  );
}
