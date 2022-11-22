import React, { FC, useState } from "react";
import { LxdSnapshot } from "../../types/instance";
import { deleteSnapshot } from "../../api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";
import { NotificationHelper } from "../../types/notification";

type Props = {
  instanceName: string;
  snapshot: LxdSnapshot;
  notify: NotificationHelper;
};

const DeleteSnapshotBtn: FC<Props> = ({ instanceName, snapshot, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteSnapshot(instanceName, snapshot)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        notify.success("Snapshot deleted.");
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on snapshot delete.", e);
      });
  };

  return (
    <button onClick={handleDelete} className="is-dense">
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--delete"
        }
      >
        Delete
      </i>
    </button>
  );
};

export default DeleteSnapshotBtn;
