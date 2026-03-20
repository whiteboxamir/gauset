import { redirect } from "next/navigation";

import { getMvpDeploymentFingerprint } from "@/lib/mvp-deployment";
import { requireMvpWorkspaceAccess } from "@/server/mvp/access";
import MVPRouteClient from "../MVPRouteClient";
import {
    normalizeLaunchEntryMode,
    normalizeLaunchIntent,
    normalizeLaunchProjectId,
    normalizeLaunchSceneId,
    normalizeLaunchSourceKind,
    normalizeLaunchText,
} from "../launchParams";

export const dynamic = "force-dynamic";

export default async function MVPPreviewPage({
    searchParams,
}: {
    searchParams: Promise<{ scene?: string; project?: string; intent?: string; brief?: string; refs?: string; provider?: string; source_kind?: string; entry?: string }>;
}) {
    const params = await searchParams;
    const launchSceneId = normalizeLaunchSceneId(params.scene);
    const launchProjectId = normalizeLaunchProjectId(params.project);
    const launchEntryMode = normalizeLaunchEntryMode(params.entry);
    const launchIntent = normalizeLaunchIntent(params.intent);
    const launchBrief = normalizeLaunchText(params.brief, 800);
    const launchReferences = normalizeLaunchText(params.refs, 1000);
    const launchProviderId = normalizeLaunchText(params.provider, 120);
    const launchSourceKind = normalizeLaunchSourceKind(params.source_kind);

    if (!launchSceneId) {
        const canonicalSearchParams = new URLSearchParams();
        if (launchProjectId) {
            canonicalSearchParams.set("project", launchProjectId);
        }
        if (launchIntent) {
            canonicalSearchParams.set("intent", launchIntent);
        }
        if (launchBrief) {
            canonicalSearchParams.set("brief", launchBrief);
        }
        if (launchReferences) {
            canonicalSearchParams.set("refs", launchReferences);
        }
        if (launchProviderId) {
            canonicalSearchParams.set("provider", launchProviderId);
        }
        if (launchSourceKind) {
            canonicalSearchParams.set("source_kind", launchSourceKind);
        }
        if (launchEntryMode && !launchProjectId) {
            canonicalSearchParams.set("entry", launchEntryMode);
        }

        const canonicalPath = canonicalSearchParams.size > 0 ? `/mvp?${canonicalSearchParams.toString()}` : "/mvp";
        await requireMvpWorkspaceAccess(canonicalPath);
        redirect(canonicalPath);
    }

    const workspaceSearchParams = new URLSearchParams({
        scene: launchSceneId,
    });
    if (launchProjectId) {
        workspaceSearchParams.set("project", launchProjectId);
    }
    if (launchSourceKind) {
        workspaceSearchParams.set("source_kind", launchSourceKind);
    }
    const canonicalWorkspacePath = `/mvp?${workspaceSearchParams.toString()}`;

    await requireMvpWorkspaceAccess(canonicalWorkspacePath);
    redirect(canonicalWorkspacePath);

    return (
        <MVPRouteClient
            clarityMode
            routeVariant="preview"
            launchSceneId={launchSceneId}
            launchProjectId={launchProjectId}
            launchIntent={launchIntent}
            launchBrief={launchBrief}
            launchReferences={launchReferences}
            launchProviderId={launchProviderId}
            launchEntryMode={launchEntryMode}
            launchSourceKind={launchSourceKind}
            launchWorkspaceHref={null}
            launchPreviewHref={canonicalWorkspacePath}
            deploymentFingerprint={getMvpDeploymentFingerprint()}
        />
    );
}
