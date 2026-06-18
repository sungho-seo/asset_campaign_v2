import { SideDrawer } from '@/components/drawer/SideDrawer';

type Props = {
  open: boolean;
  onClose: () => void;
  prefillQuery: string;
};

/** Phase 6에서 구현 — 신규 자산 등록 + IP 중복 처리. */
export function NewAssetDrawer({ open, onClose }: Props) {
  return (
    <SideDrawer open={open} onClose={onClose} title="신규 자산 등록" width={920}>
      <p className="text-sm text-neutral-500">신규 등록 폼은 Phase 6에서 구현됩니다.</p>
    </SideDrawer>
  );
}
