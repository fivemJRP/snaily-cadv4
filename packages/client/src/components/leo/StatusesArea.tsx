import { useListener } from "@casper124578/use-socket.io";
import { SocketEvents } from "@snailycad/config";
import { Button } from "components/Button";
import { useModal } from "context/ModalContext";
import { useValues } from "context/ValuesContext";
import { classNames } from "lib/classNames";
import useFetch from "lib/useFetch";
import { useLeoState } from "state/leoState";
import { ModalIds } from "types/ModalIds";
import { ShouldDoType, StatusValue } from "types/prisma";

export const StatusesArea = () => {
  const { codes10 } = useValues();
  const { activeOfficer, setActiveOfficer } = useLeoState();
  const { openModal } = useModal();
  const { execute } = useFetch();

  async function getActiveOfficer() {
    const { json, error } = await execute("/leo/active-officer", {
      noToast: true,
    });

    if (json.id) {
      setActiveOfficer({ ...activeOfficer, ...json });
    }

    if (error && error === "noActiveOfficer") {
      setActiveOfficer(null);
    }
  }

  useListener(
    SocketEvents.UpdateOfficerStatus,
    () => {
      getActiveOfficer();
    },
    [setActiveOfficer, activeOfficer],
  );

  const isButtonDisabled =
    !activeOfficer ||
    activeOfficer.status === null ||
    activeOfficer.status.shouldDo === ShouldDoType.SET_OFF_DUTY;

  async function handleStatusUpdate(status: StatusValue) {
    if (!activeOfficer) return;
    if (status.id === activeOfficer.statusId) return;

    const { json } = await execute(`/leo/${activeOfficer.id}/status`, {
      method: "PUT",
      data: {
        status: status.id,
      },
    });

    if (json.id) {
      setActiveOfficer({ ...activeOfficer, ...json });
    }
  }

  const onDutyCode = codes10.values.find((v) => v.shouldDo === ShouldDoType.SET_ON_DUTY);
  const isOnDutyActive = !isButtonDisabled && onDutyCode?.id === activeOfficer?.status?.id;

  return (
    <ul className="status-buttons-grid mt-2 px-4 py-2 bg-gray-300/50">
      <li>
        <Button
          className={classNames(
            "w-full min-w-[5em]",
            isOnDutyActive && "bg-blue-500 hover:bg-blue-600 font-semibold",
          )}
          onClick={() => openModal(ModalIds.SelectOfficer)}
        >
          {onDutyCode?.value.value}
        </Button>
      </li>

      {codes10.values
        .filter((v) => v.shouldDo !== ShouldDoType.SET_ON_DUTY)
        .sort((a, b) => Number(a.position) - Number(b.position))
        .map((code) => {
          const variant = code.shouldDo === ShouldDoType.SET_OFF_DUTY ? "danger" : "default";
          const isActive = code.id === activeOfficer?.statusId;

          return (
            <li key={code.id}>
              <Button
                onClick={() => handleStatusUpdate(code)}
                disabled={isButtonDisabled}
                variant={variant}
                className={classNames(
                  "w-full min-w-[5em]",
                  isActive && "bg-blue-500 hover:bg-blue-600 font-semibold",
                )}
              >
                {code.value.value}
              </Button>
            </li>
          );
        })}
    </ul>
  );
};
