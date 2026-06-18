import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { ToggleGroup } from '@/components/common/ToggleGroup';
import { Badge } from '@/components/common/Badge';
import { Panel } from '@/components/layout/Panel';
import { Tabs } from '@/components/layout/Tabs';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Modal } from '@/components/feedback/Modal';
import { ValidationBanner } from '@/components/feedback/ValidationBanner';
import { toast } from '@/stores/toastStore';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <span className="w-40 shrink-0 text-xs font-medium text-neutral-500">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/** Phase 2 컴포넌트 변형 시연 페이지. /demo (dev). */
export default function Demo() {
  const [toggle, setToggle] = useState<'yes' | 'no' | null>('yes');
  const [tab, setTab] = useState('all');
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(false);
  const [conflict, setConflict] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <h1 className="text-xl font-bold text-neutral-900">디자인 시스템 / 공통 컴포넌트</h1>

      <Panel title="Button">
        <Row label="variant">
          <Button variant="primary">Primary</Button>
          <Button variant="default">Default</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row label="size / icon / disabled">
          <Button size="sm" variant="primary">
            <Plus size={14} /> 작게
          </Button>
          <Button variant="default">
            <UserPlus size={16} /> 내 정보로 채우기
          </Button>
          <Button disabled>비활성</Button>
        </Row>
      </Panel>

      <Panel title="Input / Select / Textarea / ToggleGroup">
        <Row label="Input">
          <Input placeholder="자산명(Hostname)" className="max-w-xs" />
          <Input mono placeholder="10.20.30.40" className="max-w-[160px]" />
          <Input invalid placeholder="오류 상태" className="max-w-xs" />
        </Row>
        <Row label="Select">
          <Select
            className="max-w-xs"
            placeholder="운영체제 선택"
            options={[
              { value: 'rocky', label: 'Rocky Linux' },
              { value: 'ubuntu', label: 'Ubuntu' },
            ]}
            defaultValue=""
          />
        </Row>
        <Row label="Textarea">
          <Textarea placeholder="사용 목적/서비스명" className="max-w-md" />
        </Row>
        <Row label="ToggleGroup">
          <ToggleGroup
            value={toggle}
            onChange={setToggle}
            options={[
              { value: 'yes', label: '예' },
              { value: 'no', label: '아니오' },
            ]}
          />
        </Row>
      </Panel>

      <Panel title="Badge">
        <Row label="variant">
          <Badge variant="mine">내 자산</Badge>
          <Badge variant="unassigned">미할당</Badge>
          <Badge variant="assigned">할당됨</Badge>
          <Badge variant="success">갱신</Badge>
          <Badge variant="info">신규</Badge>
          <Badge variant="warn">주의</Badge>
          <Badge variant="danger">충돌</Badge>
        </Row>
      </Panel>

      <Panel title="Tabs">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: '통합' },
            { value: 'ip', label: 'IP', count: 3 },
            { value: 'host', label: '자산명' },
            { value: 'owner', label: '담당자' },
          ]}
        />
      </Panel>

      <Panel title="ValidationBanner">
        <ValidationBanner
          items={[
            { field: 'hostname', label: '자산명' },
            { field: 'ip', label: 'IP 주소' },
            { field: 'os', label: '운영체제' },
          ]}
          onChipClick={(f) => toast.info(`→ ${f} 필드로 이동`)}
        />
      </Panel>

      <Panel title="Overlay / Toast">
        <Row label="trigger">
          <Button variant="primary" onClick={() => setDrawer(true)}>
            SideDrawer 열기
          </Button>
          <Button onClick={() => setModal(true)}>기본 Modal</Button>
          <Button variant="danger" onClick={() => setConflict(true)}>
            충돌 비교 Modal
          </Button>
          <Button variant="default" onClick={() => toast.success('변경이 저장되었습니다.')}>
            Toast (success)
          </Button>
          <Button variant="ghost" onClick={() => toast.warn('동일 IP 자산이 있습니다.')}>
            Toast (warn)
          </Button>
        </Row>
      </Panel>

      <SideDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="ASSET-001 · web-prod-01"
        subtitle="마지막 수정: 2026-06-15 14:20 (이몽룡)"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDrawer(false)}>취소</Button>
            <Button variant="primary" onClick={() => setDrawer(false)}>
              변경 저장
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          재사용 사이드 패널. 임직원 자산 편집과 대시보드 사이드 패널이 이 컴포넌트를 공유합니다.
        </p>
      </SideDrawer>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="기본 모달"
        footer={
          <>
            <Button onClick={() => setModal(false)}>취소</Button>
            <Button variant="primary" onClick={() => setModal(false)}>
              확인
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">기본 모달 본문 영역입니다.</p>
      </Modal>

      <Modal
        open={conflict}
        onClose={() => setConflict(false)}
        size="xl"
        title="동시 수정 충돌 — 3중 비교"
        footer={
          <>
            <Button onClick={() => setConflict(false)}>취소</Button>
            <Button variant="default" onClick={() => setConflict(false)}>
              다른 사람 수정 가져오기
            </Button>
            <Button variant="danger" onClick={() => setConflict(false)}>
              내 변경으로 덮어쓰기
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-3 text-sm">
          {['원본 (열람 시점)', '다른 사람의 변경', '내 입력'].map((h, i) => (
            <div key={h} className="rounded-md border border-neutral-200">
              <div className="border-b border-neutral-100 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-600">
                {h}
              </div>
              <div className="space-y-1 px-3 py-2 font-mono text-xs">
                <div>OS: {i === 1 ? 'Ubuntu 22.04' : 'Rocky 9.3'}</div>
                <div>IP: 10.20.30.40</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
