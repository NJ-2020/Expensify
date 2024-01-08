import Log from '@libs/Log';
import type {VisibilityStatus} from './types';

function resolveAfter(delay: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, delay));
}

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);

    return document.fonts.ready.then(() => {
        const splash = document.getElementById('splash');

        resolveAfter(200).then(() => {
            // wait 250ms so the rendering can finish
            if (!splash) {
                return;
            }

            splash.style.opacity = '0';
        });

        return resolveAfter(500).then(() => {
            if (!splash?.parentNode) {
                return;
            }
            splash.parentNode.removeChild(splash);
        });
    });
}

function getVisibilityStatus(): Promise<VisibilityStatus> {
    return Promise.resolve(document.getElementById('splash') ? 'visible' : 'hidden');
}

export default {
    hide,
    getVisibilityStatus,
    logoSizeRatio: 1,
    navigationBarHeight: 0,
};
