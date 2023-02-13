import React, { FC, useState } from "react";
import { List, Row, Tabs } from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useNavigate, useParams } from "react-router-dom";
import InstanceVga from "./InstanceVga";
import InstanceSnapshots from "./InstanceSnapshots";
import NotificationRow from "components/NotificationRow";
import useNotification from "util/useNotification";
import { useQuery } from "@tanstack/react-query";
import { fetchInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import StartStopInstanceBtn from "./actions/StartStopInstanceBtn";
import FreezeInstanceBtn from "./actions/FreezeInstanceBtn";
import InstanceTextConsole from "pages/instances/InstanceTextConsole";
import InstanceLogs from "pages/instances/InstanceLogs";

const TABS: string[] = [
  "Overview",
  "Snapshots",
  "Terminal",
  "Text Console",
  "VGA Console",
  "Logs",
];

const tabNameToUrl = (name: string) => {
  return name.replace(" ", "-").toLowerCase();
};

const InstanceDetail: FC = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();
  const [controlTarget, setControlTarget] = useState<HTMLSpanElement | null>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, name],
    queryFn: () => fetchInstance(name, project),
  });

  if (error) {
    notify.failure("Could not load instance details.", error);
  }

  const handleTabChange = (newTab: string) => {
    notify.clear();
    if (newTab === "overview") {
      navigate(`/ui/${project}/instances/${name}`);
    } else {
      navigate(`/ui/${project}/instances/${name}/${newTab}`);
    }
  };

  return (
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          {instance ? (
            <List
              className="p-panel__title"
              inline
              items={[
                <span key="name">{name}</span>,
                <i key="status" className="p-text--small">
                  {instance.status}
                </i>,
                <StartStopInstanceBtn
                  key="start-stop"
                  instance={instance}
                  notify={notify}
                />,
                <FreezeInstanceBtn
                  key="freeze-unfreeze"
                  instance={instance}
                  notify={notify}
                />,
              ]}
            />
          ) : (
            <h4 className="p-panel__title">{name}</h4>
          )}
          <div className="p-panel__controls">
            {<span id="control-target" ref={(ref) => setControlTarget(ref)} />}
          </div>
        </div>
        <div className="p-panel__content">
          <NotificationRow notify={notify} />
          {isLoading && <Loader text="Loading instance details..." />}
          {!isLoading && !instance && <>Could not load instance details.</>}
          {!isLoading && instance && (
            <Row>
              <Tabs
                links={TABS.map((tab) => ({
                  label: tab,
                  active:
                    tabNameToUrl(tab) === activeTab ||
                    (tab === "Overview" && !activeTab),
                  onClick: () => handleTabChange(tabNameToUrl(tab)),
                }))}
              />

              {!activeTab && (
                <div tabIndex={0} role="tabpanel" aria-labelledby="overview">
                  <InstanceOverview
                    instance={instance}
                    controlTarget={controlTarget}
                    notify={notify}
                  />
                </div>
              )}

              {activeTab === "snapshots" && (
                <div tabIndex={1} role="tabpanel" aria-labelledby="snapshots">
                  <InstanceSnapshots
                    instance={instance}
                    controlTarget={controlTarget}
                    notify={notify}
                  />
                </div>
              )}

              {activeTab === "terminal" && (
                <div tabIndex={2} role="tabpanel" aria-labelledby="terminal">
                  <InstanceTerminal
                    controlTarget={controlTarget}
                    notify={notify}
                  />
                </div>
              )}

              {activeTab === "text-console" && (
                <div
                  tabIndex={3}
                  role="tabpanel"
                  aria-labelledby="text console"
                >
                  <InstanceTextConsole instance={instance} notify={notify} />
                </div>
              )}

              {activeTab === "vga-console" && (
                <div tabIndex={4} role="tabpanel" aria-labelledby="vga console">
                  <InstanceVga controlTarget={controlTarget} notify={notify} />
                </div>
              )}

              {activeTab === "logs" && (
                <div tabIndex={5} role="tabpanel" aria-labelledby="logs">
                  <InstanceLogs instance={instance} />
                </div>
              )}
            </Row>
          )}
        </div>
      </div>
    </main>
  );
};

export default InstanceDetail;
