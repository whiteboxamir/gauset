import { redirect } from "next/navigation";

import { getMvpDeploymentFingerprint } from "@/lib/mvp-deployment";
import { requireMvpWorkspaceAccess } from "@/server/mvp/access";
import MVPRouteClient from "./MVPRouteClient";
import {
    normalizeLaunchEntryMode,
    normalizeLaunchIntent,
    normalizeLaunchProjectId,
    normalizeLaunchSceneId,
    normalizeLaunchSourceKind,
    normalizeLaunchText,
} from "./launchParams";

export const dynamic = "force-dynamic";

export default async function MVPPage({
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
    const resolvedLaunchEntryMode = launchSceneId ? null : launchEntryMode;
    const resolvedLaunchIntent = launchSceneId ? null : launchIntent;
    const resolvedLaunchBrief = launchSceneId ? null : launchBrief;
    const resolvedLaunchReferences = launchSceneId ? null : launchReferences;
    const resolvedLaunchProviderId = launchSceneId ? null : launchProviderId;
    const directProjectFrontDoor = Boolean(launchProjectId) && !launchSceneId;

    if (launchSceneId) {
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

        if (launchEntryMode || launchIntent || launchBrief || launchReferences || launchProviderId) {
            redirect(canonicalWorkspacePath);
        }
    }

    const nextSearchParams = new URLSearchParams();
    if (launchSceneId) {
        nextSearchParams.set("scene", launchSceneId);
    }
    if (launchProjectId) {
        nextSearchParams.set("project", launchProjectId);
    }
    if (resolvedLaunchIntent) {
        nextSearchParams.set("intent", resolvedLaunchIntent);
    }
    if (resolvedLaunchBrief) {
        nextSearchParams.set("brief", resolvedLaunchBrief);
    }
    if (resolvedLaunchReferences) {
        nextSearchParams.set("refs", resolvedLaunchReferences);
    }
    if (resolvedLaunchProviderId) {
        nextSearchParams.set("provider", resolvedLaunchProviderId);
    }
    if (launchSourceKind) {
        nextSearchParams.set("source_kind", launchSourceKind);
    }
    if (resolvedLaunchEntryMode && !launchSceneId) {
        nextSearchParams.set("entry", resolvedLaunchEntryMode);
    }
    const nextPath = nextSearchParams.size > 0 ? `/mvp?${nextSearchParams.toString()}` : "/mvp";

    await requireMvpWorkspaceAccess(nextPath);

    if (!launchSceneId) {
        const previewSearchParams = new URLSearchParams();
        if (launchProjectId) {
            previewSearchParams.set("project", launchProjectId);
        }
        if (resolvedLaunchIntent) {
            previewSearchParams.set("intent", resolvedLaunchIntent);
        }
        if (resolvedLaunchBrief) {
            previewSearchParams.set("brief", resolvedLaunchBrief);
        }
        if (resolvedLaunchReferences) {
            previewSearchParams.set("refs", resolvedLaunchReferences);
        }
        if (resolvedLaunchProviderId) {
            previewSearchParams.set("provider", resolvedLaunchProviderId);
        }
        if (launchSourceKind) {
            previewSearchParams.set("source_kind", launchSourceKind);
        }
        if (resolvedLaunchEntryMode) {
            previewSearchParams.set("entry", resolvedLaunchEntryMode);
        }

        const launchPreviewParams = new URLSearchParams(previewSearchParams);
        const launchPreviewHref =
            launchProjectId
                ? `/app/worlds/${launchProjectId}#project-world-launch`
                : (() => {
                      launchPreviewParams.delete("entry");
                      return launchPreviewParams.size > 0 ? `/mvp?${launchPreviewParams.toString()}` : "/mvp";
                  })();
        const workspaceSearchParams = new URLSearchParams(launchPreviewParams);
        if (!directProjectFrontDoor) {
            workspaceSearchParams.set("entry", "workspace");
        }
        const launchWorkspaceHref =
            directProjectFrontDoor
                ? (() => {
                      const projectWorkspaceParams = new URLSearchParams(previewSearchParams);
                      projectWorkspaceParams.set("entry", "workspace");
                      return `/mvp?${projectWorkspaceParams.toString()}`;
                  })()
                : `/mvp?${workspaceSearchParams.toString()}`;

        return (
            <MVPRouteClient
                clarityMode
                routeVariant="preview"
                launchSceneId={null}
                launchProjectId={launchProjectId}
                launchIntent={resolvedLaunchIntent}
                launchBrief={resolvedLaunchBrief}
                launchReferences={resolvedLaunchReferences}
                launchProviderId={resolvedLaunchProviderId}
                launchEntryMode={resolvedLaunchEntryMode}
                launchSourceKind={launchSourceKind}
                launchWorkspaceHref={launchWorkspaceHref}
                launchPreviewHref={launchPreviewHref}
                deploymentFingerprint={getMvpDeploymentFingerprint()}
            />
        );
    }

    return (
        <MVPRouteClient
            clarityMode={process.env.NEXT_PUBLIC_MVP_CLARITY_DEFAULT === "1"}
            routeVariant="workspace"
            launchSceneId={launchSceneId}
            launchProjectId={launchProjectId}
            launchIntent={resolvedLaunchIntent}
            launchBrief={resolvedLaunchBrief}
            launchReferences={resolvedLaunchReferences}
            launchProviderId={resolvedLaunchProviderId}
            launchEntryMode={resolvedLaunchEntryMode}
            launchSourceKind={launchSourceKind}
            launchWorkspaceHref={null}
            launchPreviewHref={null}
            deploymentFingerprint={getMvpDeploymentFingerprint()}
        />
    );
}
