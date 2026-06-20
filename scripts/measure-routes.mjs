const baseUrl = process.env.BASE_URL || "https://sherwood-connect.vercel.app";
const paths = (process.env.PATHS || "/,/api/health,/api/profile,/api/google-sheets")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);
const runs = Number(process.env.RUNS || 12);
const warmup = Number(process.env.WARMUP || 2);

function percentile(values, percent) {
  return values[Math.min(values.length - 1, Math.ceil((percent / 100) * values.length) - 1)];
}

function formatMs(value) {
  return `${value.toFixed(1)}ms`;
}

function formatStatuses(statuses) {
  return [...statuses.entries()]
    .map(([status, count]) => `${status}x${count}`)
    .join(",");
}

for (const path of paths) {
  const samples = [];
  const statuses = new Map();

  for (let i = 0; i < runs + warmup; i += 1) {
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}${path}`, {
      cache: "no-store",
      redirect: "follow",
    });
    await response.arrayBuffer();
    const elapsed = performance.now() - startedAt;

    if (i >= warmup) {
      samples.push(elapsed);
      statuses.set(response.status, (statuses.get(response.status) || 0) + 1);
    }
  }

  samples.sort((a, b) => a - b);

  console.log(
    [
      path,
      `status=${formatStatuses(statuses)}`,
      `min=${formatMs(samples[0])}`,
      `median=${formatMs(percentile(samples, 50))}`,
      `p95=${formatMs(percentile(samples, 95))}`,
      `max=${formatMs(samples.at(-1))}`,
    ].join(" "),
  );
}
