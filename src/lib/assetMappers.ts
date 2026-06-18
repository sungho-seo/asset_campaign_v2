import type { Asset } from '@/types/domain';
import type { AssetFormValues } from './assetSchema';
import type { AssetFields } from './api/assets';

export function assetToFormValues(asset: Asset): AssetFormValues {
  return {
    assetType: asset.assetType ?? 'on-premise',
    hostname: asset.hostname,
    servicePurpose: asset.servicePurpose ?? '',
    ips: asset.ips.length ? [...asset.ips] : [''],
    externalAccess: asset.externalAccess,
    domain: asset.domain ?? '',
    os: asset.os,
    osVersion: asset.osVersion,
    location: asset.location ?? '',
    securitySolution: asset.securitySolution ?? '',
    csp: asset.cloud?.csp ?? '',
    accountId: asset.cloud?.accountId ?? '',
    environment: asset.cloud?.environment,
    dataClass: asset.cloud?.dataClass ?? '',
  };
}

export function emptyFormValues(prefillIp?: string, prefillHost?: string): AssetFormValues {
  return {
    assetType: 'on-premise',
    hostname: prefillHost ?? '',
    servicePurpose: '',
    ips: [prefillIp ?? ''],
    externalAccess: null,
    domain: '',
    os: '',
    osVersion: '',
    location: '',
    securitySolution: '',
    csp: '',
    accountId: '',
    environment: undefined,
    dataClass: '',
  };
}

export function formValuesToFields(v: AssetFormValues): AssetFields {
  return {
    assetType: v.assetType,
    hostname: v.hostname.trim(),
    servicePurpose: v.servicePurpose?.trim() || null,
    ips: v.ips.map((ip) => ip.trim()).filter(Boolean),
    externalAccess: v.externalAccess,
    domain: v.domain?.trim() || null,
    os: v.os,
    osVersion: v.osVersion.trim(),
    location: v.location?.trim() || null,
    securitySolution: v.securitySolution?.trim() || null,
    cloud:
      v.assetType === 'cloud'
        ? {
            csp: v.csp ?? '',
            accountId: v.accountId ?? '',
            environment: v.environment ?? 'Production',
            dataClass: v.dataClass?.trim() || null,
          }
        : undefined,
  };
}
