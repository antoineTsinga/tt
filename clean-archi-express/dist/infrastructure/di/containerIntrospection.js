/**
 * Take a snapshot of the current registrations in the given container.
 * Uses internal tsyringe APIs, intended for debugging purposes.
 * @param container
 * @returns ContainerSnapshot
 */
export function snapshotContainer(container) {
    const internal = container;
    const registry = internal._registry;
    if (!registry || typeof registry.entries !== "function") {
        return { byToken: new Map() };
    }
    const byToken = new Map();
    for (const [token, registrations] of registry.entries()) {
        const infos = registrations.map((reg) => {
            const provider = reg.provider ?? reg; // suivant version
            let providerKind = "unknown";
            if (provider.useClass)
                providerKind = "class";
            else if (provider.useValue !== undefined)
                providerKind = "value";
            else if (provider.useFactory)
                providerKind = "factory";
            else if (provider.useToken)
                providerKind = "token";
            return {
                token,
                providerKind,
                provider,
                raw: reg,
            };
        });
        byToken.set(token, infos);
    }
    return { byToken };
}
