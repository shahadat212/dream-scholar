import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3200,
    timerProgressBar: true,
    customClass: {
        popup: '!rounded-2xl !px-4 !py-3 !font-body !shadow-[0_20px_50px_-20px_rgba(20,20,31,0.35)]',
        title: '!text-sm !font-bold !text-ink',
        htmlContainer: '!m-0 !mt-1 !text-xs !text-ink/60',
        timerProgressBar: '!bg-violet/40',
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
});

const useToast = () => {
    return Toast;
};

export default useToast;
