/*
    Common
 */

/** Domain (hostname or ip-address) */
export var DOMAIN = 'ndrone';

/** Minimum time (natural number) between restarts workers */
export var WORKER_RESTART_TIMEOUT = 500;

/** TCP port (1..65535) for video transferring */
export var FPV_VIDEO_PORT = 8081;

/** Maximum timeout between activity on TCP socket */
export var FPV_VIDEO_TIMEOUT = 1000;

/** UDP port (1..65535) for transferring of navdata and state */
export var FPV_INFO_PORT = 8082;

/** Maximum timeout between activity on UDP socket */
export var FPV_INFO_TIMEOUT = 1000;


/*
    Video
 */

export var FPV_VIDEO_WIDTH = 853;
export var FPV_VIDEO_HEIGHT = 480;
export var FPV_VIDEO_FPS = 25;

/** Bitrate (bit/s) of video stream. Set to 0 to disable control */
export var FPV_VIDEO_BITRATE = 2e6;

/** Size of GoP (group of pictures). Set to 0 to disable control */
export var FPV_VIDEO_GOP_SIZE = 0;

/** Whether to use horizontal flip */
export var FPV_VIDEO_HFLIP = true;

/** Whether to use vertical flip */
export var FPV_VIDEO_VFLIP = true;
