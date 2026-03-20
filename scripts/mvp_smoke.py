#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_BASE_URL = "http://127.0.0.1:3015"
POLL_TIMEOUT_SECONDS = 180
DEFAULT_ASSET_IMAGE = Path("public/images/hero_render.png")
DEFAULT_ENVIRONMENT_IMAGE = Path("public/images/hero/interior_daylight.png")


def request(method: str, url: str, payload: bytes | None = None, headers: dict[str, str] | None = None) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=payload, headers=headers or {}, method=method)
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.status, response.read()


def upload_file(api_base_url: str, file_path: Path) -> dict:
    web_base_url = api_base_url.removesuffix("/api/mvp")
    command = [
        "node",
        "scripts/mvp_upload_client.mjs",
        "--base-url",
        web_base_url,
        "--file",
        str(file_path),
    ]
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"upload helper failed ({result.returncode}): {result.stderr or result.stdout}")
    payload = json.loads(result.stdout)
    upload_payload = payload.get("upload")
    if not isinstance(upload_payload, dict):
        raise RuntimeError(f"upload helper did not return upload payload: {payload}")
    return upload_payload


def start_generation(api_base_url: str, kind: str, image_id: str) -> dict:
    status, raw = request(
        "POST",
        f"{api_base_url}/generate/{kind}",
        payload=json.dumps({"image_id": image_id}).encode(),
        headers={"Content-Type": "application/json"},
    )
    if status != 200:
        raise RuntimeError(f"generation start failed ({status}): {raw.decode(errors='ignore')}")
    return json.loads(raw.decode())


def poll_job(api_base_url: str, job_id: str) -> dict:
    deadline = time.time() + POLL_TIMEOUT_SECONDS
    while time.time() < deadline:
        _, raw = request("GET", f"{api_base_url}/jobs/{job_id}")
        payload = json.loads(raw.decode())
        if payload["status"] in {"completed", "failed"}:
            return payload
        time.sleep(1)
    raise TimeoutError(f"timed out waiting for job {job_id}")


def head(url: str) -> int:
    req = urllib.request.Request(url, method="HEAD")
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.status


def save_scene(api_base_url: str, scene_id: str, scene_graph: dict) -> dict:
    status, raw = request(
        "POST",
        f"{api_base_url}/scene/save",
        payload=json.dumps({"scene_id": scene_id, "scene_graph": scene_graph, "source": "manual"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    if status != 200:
        raise RuntimeError(f"scene save failed ({status}): {raw.decode(errors='ignore')}")
    return json.loads(raw.decode())


def post_comment(api_base_url: str, scene_id: str, version_id: str, body: str) -> dict:
    status, raw = request(
        "POST",
        f"{api_base_url}/scene/{scene_id}/versions/{version_id}/comments",
        payload=json.dumps({"author": "Smoke QA", "body": body, "anchor": "scene"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    if status != 200:
        raise RuntimeError(f"comment save failed ({status}): {raw.decode(errors='ignore')}")
    return json.loads(raw.decode())


def update_review(api_base_url: str, scene_id: str) -> dict:
    status, raw = request(
        "POST",
        f"{api_base_url}/scene/{scene_id}/review",
        payload=json.dumps(
            {
                "metadata": {
                    "project_name": "Smoke Test Project",
                    "scene_title": "Proxy Validation",
                    "location_name": "Localhost",
                    "owner": "Smoke QA",
                    "notes": "Automated review metadata validation.",
                },
                "approval_state": "approved",
                "updated_by": "Smoke QA",
                "note": "Automated approval pass.",
            }
        ).encode(),
        headers={"Content-Type": "application/json"},
    )
    if status != 200:
        raise RuntimeError(f"review update failed ({status}): {raw.decode(errors='ignore')}")
    return json.loads(raw.decode())


def review_shell_present(web_base_url: str, scene_id: str, version_id: str) -> bool:
    query = urllib.parse.urlencode({"scene": scene_id, "version": version_id})
    _, raw = request("GET", f"{web_base_url}/mvp/review?{query}")
    return "Read-only Scene Review" in raw.decode(errors="ignore")


def run_asset_smoke(api_base_url: str, file_path: Path) -> dict:
    upload = upload_file(api_base_url, file_path)
    generation = start_generation(api_base_url, "asset", upload["image_id"])
    job = poll_job(api_base_url, generation["job_id"])
    if job["status"] != "completed":
        raise RuntimeError(job.get("error") or "asset generation failed")
    preview_status = head(f"{api_base_url}{job['result']['urls']['preview']}")
    return {
        "type": "asset",
        "job_id": generation["job_id"],
        "asset_id": job["result"]["asset_id"],
        "preview_status": preview_status,
    }


def run_environment_smoke(api_base_url: str, web_base_url: str, file_path: Path) -> dict:
    upload = upload_file(api_base_url, file_path)
    generation = start_generation(api_base_url, "environment", upload["image_id"])
    job = poll_job(api_base_url, generation["job_id"])
    if job["status"] != "completed":
        raise RuntimeError(job.get("error") or "environment generation failed")
    splat_status = head(f"{api_base_url}{job['result']['urls']['splats']}")
    scene_id = job["result"]["scene_id"]
    saved = save_scene(
        api_base_url,
        scene_id,
        {
            "environment": {
                "id": scene_id,
                "urls": job["result"]["urls"],
            },
            "assets": [],
        },
    )
    review = update_review(api_base_url, scene_id)
    comment = post_comment(api_base_url, scene_id, saved["version_id"], "Environment smoke comment.")
    review_ready = review_shell_present(web_base_url, scene_id, saved["version_id"])
    return {
        "type": "environment",
        "job_id": generation["job_id"],
        "scene_id": scene_id,
        "splat_status": splat_status,
        "version_id": saved["version_id"],
        "approval_state": review["approval"]["state"],
        "comment_id": comment["comment"]["comment_id"],
        "review_shell_present": review_ready,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Gauset MVP smoke tests through the Next.js proxy.")
    parser.add_argument("--mode", choices=["asset", "environment", "full"], default="full")
    parser.add_argument("--web-base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--asset-image", default=str(DEFAULT_ASSET_IMAGE))
    parser.add_argument("--environment-image", default=str(DEFAULT_ENVIRONMENT_IMAGE))
    args = parser.parse_args()

    web_base_url = args.web_base_url.rstrip("/")
    api_base_url = f"{web_base_url}/api/mvp"
    results: list[dict] = []

    if args.mode in {"asset", "full"}:
        results.append(run_asset_smoke(api_base_url, Path(args.asset_image)))
    if args.mode in {"environment", "full"}:
        results.append(run_environment_smoke(api_base_url, web_base_url, Path(args.environment_image)))

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
