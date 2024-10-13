import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, Divider, Stack, SvgIcon, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab";
import { ActionList } from "/src/components/action-list";
import { ActionListItem } from "/src/components/action-list-item";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import CloseIcon from "@mui/icons-material/Close";
import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import _ from "lodash";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";

const StyledTimelineDot = (props) => {
  const { complete } = props;

  return (
    <TimelineDot
      sx={{
        alignSelf: "center",
        boxShadow: "none",
        flexShrink: 0,
        height: 36,
        justifyContent: "center",
        width: 36,
        backgroundColor: complete ? "success.main" : "error.main",
        borderColor: complete ? "success.main" : "error.main",
        color: complete ? "success.contrastText" : "error.contrastText",
      }}
    >
      <SvgIcon fontSize="small">{complete ? <CheckIcon /> : <CloseIcon />}</SvgIcon>
    </TimelineDot>
  );
};

const StyledTimelineConnector = styled(TimelineConnector)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.neutral[800] : theme.palette.neutral[200],
  height: 24,
}));

const StyledTimelineContent = styled(TimelineContent)(({ theme }) => ({
  padding: "14px 16px",
  ...theme.typography.overline,
}));

const CippStandardsSideBar = ({
  title,
  selectedStandards,
  steps,
  actions,
  updatedAt,
  formControl,
  createDialog,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const watchForm = useWatch({ control: formControl.control });

  useEffect(() => {
    const stepsStatus = {
      step1: !!watchForm.templateName, // Step 1: Template name is filled
      step2: Object.keys(selectedStandards).length > 0, // Step 2: Standards added
      step3:
        watchForm.standards &&
        Object.keys(selectedStandards).length > 0 &&
        Object.keys(selectedStandards).every((standardName) => {
          const standardValues = _.get(watchForm, `${standardName}`, {});
          return standardValues.action;
        }), // Step 3: All standards configured
      step4: watchForm.tenantFilter && watchForm.tenantFilter.length > 0, // Step 4: Tenants selected
    };

    const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
    setCurrentStep(completedSteps);
  }, [selectedStandards, watchForm]);

  // Define stepsStatus outside of useEffect for use in rendering the Timeline
  const stepsStatus = {
    step1: !!watchForm.templateName,
    step2: Object.keys(selectedStandards).length > 0,
    step3:
      watchForm.standards &&
      Object.keys(selectedStandards).length > 0 &&
      Object.keys(selectedStandards).every((standardName) => {
        const standardValues = _.get(watchForm, `${standardName}`, {});
        return standardValues.action;
      }),
    step4: watchForm.tenantFilter && watchForm.tenantFilter.length > 0,
  };
  return (
    <Card>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <CippFormComponent
            type="textField"
            name="templateName"
            label="Template Name"
            formControl={formControl}
            placeholder="Enter a name for the template"
            fullWidth
          />
          <Divider />
          <CippFormTenantSelector
            allTenants={true}
            label="Included Tenants"
            formControl={formControl}
          />
          {watchForm.tenantFilter?.some((tenant) => tenant.value === "AllTenants") && (
            <>
              <Divider />
              <CippFormTenantSelector
                label="Excluded Tenants"
                name="excludedTenants"
                allTenants={false}
                formControl={formControl}
              />
            </>
          )}
          {updatedAt && (
            <Typography
              sx={{
                color: "text.secondary",
                display: "block",
              }}
              variant="caption"
            >
              Updated {updatedAt}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <Divider />
      <CardContent>
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              p: 0,
            },
          }}
        >
          {steps.map((step, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <StyledTimelineDot complete={stepsStatus[`step${index + 1}`]} />
                {index < steps.length - 1 && <StyledTimelineConnector />}
              </TimelineSeparator>
              <StyledTimelineContent>{step}</StyledTimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
      <Divider />
      <ActionList>
        {actions.map((action, index) => (
          <ActionListItem
            key={index}
            icon={<SvgIcon fontSize="small">{action.icon}</SvgIcon>}
            label={action.label}
            onClick={action.handler}
          />
        ))}
      </ActionList>
      <Divider />
      <CippApiDialog
        createDialog={createDialog}
        title="Add Standard"
        api={{
          confirmText:
            "Are you sure you want to add this standard? This will apply the template and run every 3 hours.",
          url: "/api/ExecAddStandard",
          type: "POST",
          data: {
            tenantFilter: "tenantFilter",
            templateName: "templateName",
            standards: "standards",
          },
        }}
        row={formControl.getValues()}
        formControl={formControl}
      />
      {console.log(formControl.getValues())}
    </Card>
  );
};

CippStandardsSideBar.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
      icon: PropTypes.element.isRequired,
    })
  ).isRequired,
  updatedAt: PropTypes.string,
  formControl: PropTypes.object.isRequired,
};

export default CippStandardsSideBar;