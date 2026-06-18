// §7.7 조직별 참여율 mock — 17개 대단위 조직 + 하위 트리 + 팀 구성원.
// 결정적(seeded) 생성으로 새로고침해도 동일.

export type OrgMember = {
  empNo: string;
  name: string;
  updateCount: number;
  responded: boolean;
};

export type OrgStats = {
  totalMembers: number;
  participated: number;
  assetCount: number;
  identifiedAssets: number;
  updateCount: number;
};

export type OrgNode = {
  id: string;
  name: string;
  level: number;
  members?: OrgMember[]; // 팀(leaf)만 보유
  children?: OrgNode[];
  stats: OrgStats;
};

export const BIG_ORGS = [
  'HS사업본부', 'MS사업본부', 'VS사업본부', 'ES사업본부',
  '한국영업본부', '해외영업본부',
  'CTO부문', 'CSO부문', 'CFO부문', 'CHO부문', 'CRO부문',
  'CS센터', '생산기술원', '품질경영센터', '디자인경영센터', '글로벌오퍼레이션센터',
  '기타',
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신'];
const GIVEN = ['민준', '서연', '도윤', '예린', '지후', '하은', '준서', '수아', '현우', '지민', '우진', '서윤'];

function makeMembers(rng: () => number, prefix: string, count: number): OrgMember[] {
  return Array.from({ length: count }, (_, i) => {
    const name = `${SURNAMES[Math.floor(rng() * SURNAMES.length)]}${GIVEN[Math.floor(rng() * GIVEN.length)]}`;
    return {
      empNo: `${prefix}-${i}`,
      name,
      updateCount: rng() < 0.55 ? Math.floor(rng() * 6) : 0,
      responded: rng() < 0.72,
    };
  });
}

function leafStats(members: OrgMember[], rng: () => number): OrgStats {
  const participated = members.filter((m) => m.responded).length;
  const updateCount = members.reduce((s, m) => s + m.updateCount, 0);
  const assetCount = Math.floor(rng() * 40) + members.length;
  const identifiedAssets = Math.min(assetCount, Math.floor(assetCount * (0.15 + rng() * 0.4)));
  return { totalMembers: members.length, participated, assetCount, identifiedAssets, updateCount };
}

function aggregate(children: OrgNode[]): OrgStats {
  return children.reduce(
    (acc, c) => ({
      totalMembers: acc.totalMembers + c.stats.totalMembers,
      participated: acc.participated + c.stats.participated,
      assetCount: acc.assetCount + c.stats.assetCount,
      identifiedAssets: acc.identifiedAssets + c.stats.identifiedAssets,
      updateCount: acc.updateCount + c.stats.updateCount,
    }),
    { totalMembers: 0, participated: 0, assetCount: 0, identifiedAssets: 0, updateCount: 0 },
  );
}

const SUFFIX_BY_LEVEL = ['', '담당', '실', '팀'];

function buildTree(orgName: string): OrgNode {
  const rng = mulberry32(hashSeed(orgName));
  const groupCount = 2 + Math.floor(rng() * 2);

  const groups: OrgNode[] = Array.from({ length: groupCount }, (_, gi) => {
    const groupName = `${orgName.replace(/(부문|사업본부|본부|센터|원)$/, '')} ${gi + 1}그룹`;
    const deptCount = 2 + Math.floor(rng() * 2);
    const depts: OrgNode[] = Array.from({ length: deptCount }, (_, di) => {
      const deptName = `${gi + 1}-${di + 1}${SUFFIX_BY_LEVEL[1]}`;
      const teamCount = 2 + Math.floor(rng() * 2);
      const teams: OrgNode[] = Array.from({ length: teamCount }, (_, ti) => {
        const members = makeMembers(rng, `${orgName}-${gi}${di}${ti}`, 3 + Math.floor(rng() * 6));
        // 일부 팀은 100% 참여
        if (rng() < 0.18) members.forEach((m) => (m.responded = true));
        return {
          id: `${orgName}-g${gi}-d${di}-t${ti}`,
          name: `${gi + 1}-${di + 1}-${ti + 1}팀`,
          level: 3,
          members,
          stats: leafStats(members, rng),
        };
      });
      return { id: `${orgName}-g${gi}-d${di}`, name: deptName, level: 2, children: teams, stats: aggregate(teams) };
    });
    return { id: `${orgName}-g${gi}`, name: groupName, level: 1, children: depts, stats: aggregate(depts) };
  });

  return { id: orgName, name: orgName, level: 0, children: groups, stats: aggregate(groups) };
}

// '기타' — 본사 소속 작은 조직 평면 목록 (팀 leaf만)
function buildEtc(): OrgNode {
  const rng = mulberry32(hashSeed('기타'));
  const names = ['비서실', '감사팀', '홍보팀', '대외협력팀', '법무팀', '사회공헌팀'];
  const teams: OrgNode[] = names.map((n, i) => {
    const members = makeMembers(rng, `기타-${i}`, 2 + Math.floor(rng() * 5));
    return { id: `기타-${i}`, name: n, level: 1, members, stats: leafStats(members, rng) };
  });
  return { id: '기타', name: '기타', level: 0, children: teams, stats: aggregate(teams) };
}

// CRO부문에 정보보호담당 > 정보보호가시화팀(서성호 포함) 주입 — 임직원 화면과 일관성
function injectInfoSec(node: OrgNode): OrgNode {
  const rng = mulberry32(hashSeed('정보보호가시화팀'));
  const members = makeMembers(rng, 'visz', 11);
  members.unshift({ empNo: 'E20210001', name: '서성호', updateCount: 4, responded: true });
  const team: OrgNode = {
    id: 'cro-info-vis',
    name: '정보보호가시화팀',
    level: 2,
    members,
    stats: leafStats(members, rng),
  };
  const infoSecDept: OrgNode = {
    id: 'cro-info-sec',
    name: '정보보호담당',
    level: 1,
    children: [team],
    stats: aggregate([team]),
  };
  const children = [infoSecDept, ...(node.children ?? [])];
  return { ...node, children, stats: aggregate(children) };
}

export const ORG_TREES: Record<string, OrgNode> = Object.fromEntries(
  BIG_ORGS.map((name) => {
    if (name === '기타') return [name, buildEtc()];
    if (name === 'CRO부문') return [name, injectInfoSec(buildTree(name))];
    return [name, buildTree(name)];
  }),
);

export function hasHundredTeam(node: OrgNode): boolean {
  if (node.members) return node.stats.totalMembers > 0 && node.stats.participated === node.stats.totalMembers;
  return (node.children ?? []).some(hasHundredTeam);
}
