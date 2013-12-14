"use strict";

export var descriptions: string[] = [];

var index = 0;
function def(desc: any): number {
    var val = index;
    if(typeof desc === 'number') {
        val = desc;
        descriptions.push(descriptions[val]);
    } else
        descriptions.push(desc);

    ++index;
    return val;
}

export class ErrnoError implements Error {
    public message: string;
    public name = 'ErrnoError';
    public stack: string;

    constructor(public errno: number, prefix?: string) {
        (<any> Error).captureStackTrace(this, ErrnoError);
        var desc = descriptions[errno] || 'unknown error';
        this.message = prefix ? prefix + ': ' + desc : desc;
    }

    public toString() {
        return 'ErrnoError: ' + this.message;
    }
}

export var SUCCESS         = def('success');
export var EPERM           = def('operation not permitted');
export var ENOENT          = def('no such file or directory');
export var ESRCH           = def('no such process');
export var EINTR           = def('interrupted system call');
export var EIO             = def('input/output error');
export var ENXIO           = def('no such device or address');
export var E2BIG           = def('argument list too long');
export var ENOEXEC         = def('exec format error');
export var EBADF           = def('bad file descriptor');
export var ECHILD          = def('no child processes');
export var EAGAIN          = def('resource temporarily unavailable');
export var ENOMEM          = def('cannot allocate memory');
export var EACCES          = def('permission denied');
export var EFAULT          = def('bad address');
export var ENOTBLK         = def('block device required');
export var EBUSY           = def('device or resource busy');
export var EEXIST          = def('file exists');
export var EXDEV           = def('invalid cross-device link');
export var ENODEV          = def('no such device');
export var ENOTDIR         = def('not a directory');
export var EISDIR          = def('is a directory');
export var EINVAL          = def('invalid argument');
export var ENFILE          = def('too many open files in system');
export var EMFILE          = def('too many open files');
export var ENOTTY          = def('inappropriate ioctl for device');
export var ETXTBSY         = def('text file busy');
export var EFBIG           = def('file too large');
export var ENOSPC          = def('no space left on device');
export var ESPIPE          = def('illegal seek');
export var EROFS           = def('read-only file system');
export var EMLINK          = def('too many links');
export var EPIPE           = def('broken pipe');
export var EDOM            = def('numerical argument out of domain');
export var ERANGE          = def('numerical result out of range');
export var EDEADLK         = def('resource deadlock avoided');
export var ENAMETOOLONG    = def('file name too long');
export var ENOLCK          = def('no locks available');
export var ENOSYS          = def('function not implemented');
export var ENOTEMPTY       = def('directory not empty');
export var ELOOP           = def('too many levels of symbolic links');
export var EWOULDBLOCK     = def(EAGAIN);
export var ENOMSG          = def('no message of desired type');
export var EIDRM           = def('identifier removed');
export var ECHRNG          = def('channel number out of range');
export var EL2NSYNC        = def('level 2 not synchronized');
export var EL3HLT          = def('level 3 halted');
export var EL3RST          = def('level 3 reset');
export var ELNRNG          = def('link number out of range');
export var EUNATCH         = def('protocol driver not attached');
export var ENOCSI          = def('no CSI structure available');
export var EL2HLT          = def('level 2 halted');
export var EBADE           = def('invalid exchange');
export var EBADR           = def('invalid request descriptor');
export var EXFULL          = def('exchange full');
export var ENOANO          = def('no anode');
export var EBADRQC         = def('invalid request code');
export var EBADSLT         = def('invalid slot');
export var EDEADLOCK       = def(EDEADLK);
export var EBFONT          = def('bad font file format');
export var ENOSTR          = def('device not a stream');
export var ENODATA         = def('no data available');
export var ETIME           = def('timer expired');
export var ENOSR           = def('out of streams resources');
export var ENONET          = def('machine is not on the network');
export var ENOPKG          = def('package not installed');
export var EREMOTE         = def('object is remote');
export var ENOLINK         = def('link has been severed');
export var EADV            = def('advertise error');
export var ESRMNT          = def('srmount error');
export var ECOMM           = def('communication error on send');
export var EPROTO          = def('protocol error');
export var EMULTIHOP       = def('multihop attempted');
export var EDOTDOT         = def('RFS specific error');
export var EBADMSG         = def('bad message');
export var EOVERFLOW       = def('value too large for defined data type');
export var ENOTUNIQ        = def('name not unique on network');
export var EBADFD          = def('file descriptor in bad state');
export var EREMCHG         = def('remote address changed');
export var ELIBACC         = def('can not access a needed shared library');
export var ELIBBAD         = def('accessing a corrupted shared library');
export var ELIBSCN         = def('.lib section in a.out corrupted');
export var ELIBMAX         = def('attempting to link in too many shared libraries');
export var ELIBEXEC        = def('cannot exec a shared library directly');
export var EILSEQ          = def('invalid or incomplete multibyte or wide character');
export var ERESTART        = def('interrupted system call should be restarted');
export var ESTRPIPE        = def('streams pipe error');
export var EUSERS          = def('too many users');
export var ENOTSOCK        = def('socket operation on non-socket');
export var EDESTADDRREQ    = def('destination address required');
export var EMSGSIZE        = def('message too long');
export var EPROTOTYPE      = def('protocol wrong type for socket');
export var ENOPROTOOPT     = def('protocol not available');
export var EPROTONOSUPPORT = def('protocol not supported');
export var ESOCKTNOSUPPORT = def('socket type not supported');
export var EOPNOTSUPP      = def('operation not supported');
export var EPFNOSUPPORT    = def('protocol family not supported');
export var EAFNOSUPPORT    = def('address family not supported by protocol');
export var EADDRINUSE      = def('address already in use');
export var EADDRNOTAVAIL   = def('cannot assign requested address');
export var ENETDOWN        = def('network is down');
export var ENETUNREACH     = def('network is unreachable');
export var ENETRESET       = def('network dropped connection on reset');
export var ECONNABORTED    = def('software caused connection abort');
export var ECONNRESET      = def('connection reset by peer');
export var ENOBUFS         = def('no buffer space available');
export var EISCONN         = def('transport endpoint is already connected');
export var ENOTCONN        = def('transport endpoint is not connected');
export var ESHUTDOWN       = def('cannot send after transport endpoint shutdown');
export var ETOOMANYREFS    = def('too many references : cannot splice');
export var ETIMEDOUT       = def('connection timed out');
export var ECONNREFUSED    = def('connection refused');
export var EHOSTDOWN       = def('host is down');
export var EHOSTUNREACH    = def('no route to host');
export var EALREADY        = def('operation already in progress');
export var EINPROGRESS     = def('operation now in progress');
export var ESTALE          = def('stale NFS file handle');
export var EUCLEAN         = def('structure needs cleaning');
export var ENOTNAM         = def('not a XENIX named type file');
export var ENAVAIL         = def('no XENIX semaphores available');
export var EISNAM          = def('is a named type file');
export var EREMOTEIO       = def('remote I/O error');
export var EDQUOT          = def('disk quota exceeded');
export var ENOMEDIUM       = def('no medium found');
export var EMEDIUMTYPE     = def('wrong medium type');
export var ECANCELED       = def('operation canceled');
export var ENOKEY          = def('required key not available');
export var EKEYEXPIRED     = def('key has expired');
export var EKEYREVOKED     = def('key has been revoked');
export var EKEYREJECTED    = def('key was rejected by service');
export var EOWNERDEAD      = def('owner died');
export var ENOTRECOVERABLE = def('state not recoverable');
export var ERFKILL         = def('operation not possible due to RF-kill');
export var EHWPOISON       = def('memory page has hardware error');
