import { Spinner } from "@fluentui/react/lib/Spinner";
import * as React from "react";

import { IAppActions, IEntity, WebFormStep } from "../utils/Interfaces";
import { Flow } from "./Flow";

export interface IAppProps {
  getWebFormSteps: () => Promise<WebFormStep[]>;
  getEntitiesMetadata: () => Promise<Response>;
  actions: IAppActions;
}

export const App = React.memo((props: IAppProps) => {
  const [webFormSteps, setWebFormSteps] = React.useState<WebFormStep[]>([]);
  const [entities, setEntities] = React.useState<IEntity[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isMetadataLoading, setIsMetadataLoading] = React.useState(true);

  React.useEffect(() => {
    props
      .getWebFormSteps()
      .then((steps: WebFormStep[]) => {
        setWebFormSteps(steps);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });

    props
      .getEntitiesMetadata()
      .then(res => res.json())
      .then(resultJson => {
        const entitymetadata = resultJson["EntityMetadata"]; 

        const getDisplayName = (item: any) => {
          if (
            item.DisplayName?.UserLocalizedLabel != null &&
            item.DisplayName?.UserLocalizedLabel?.Label != undefined
          ) {
            return item.DisplayName.UserLocalizedLabel.Label;
          }
          return "";
        };

        let entities: IEntity[] = entitymetadata.map((item: any) => {
          return {
            logicalName: item.LogicalName,
            displayName: getDisplayName(item) || item.LogicalName,
          };
        });

        entities = entities.sort((a,b) => {
          const nameA = a.displayName.toUpperCase(); // ignore upper and lowercase
          const nameB = b.displayName.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
        
          // names must be equal
          return 0;
        });
        
        setEntities(entities);
        setIsMetadataLoading(false);
      })
      .catch(function (error) {
        console.error(error.message);
        setIsMetadataLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>      
        <Spinner label="Loading..." ariaLive="assertive" labelPosition="left" />
      </div>
    );
  } else {
    return (
      <Flow 
        actions={props.actions}
        webFormSteps={webFormSteps}
        entities={entities}
        isMetadataLoading={isMetadataLoading}
      />
    );
  }
});
