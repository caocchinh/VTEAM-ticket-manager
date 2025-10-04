import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Box,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Clock,
  FastForward,
  Loader2,
  PanelsTopLeft,
  Search,
  ShieldBan,
  X,
  XCircle,
} from "lucide-react";
import {
  OnlineManagementProps,
  OnlineSalesInfo,
  OrderSelectProps,
  VERIFICATION_STATUS,
} from "@/constants/types";
import { Separator } from "./ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn, fuzzySearch, isOverScrolling } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "./ui/sidebar";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { JumpToTabButton } from "./JumpToTabButton";
import {
  VERIFICATION_APPROVED,
  VERIFICATION_PENDING,
  VERIFICATION_FAILED,
} from "@/constants/constants";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import Loader from "./Loader/Loader";

const OrderSelect = ({
  order,
  currentTab,
  currentOrderId,
  setCurrentOrderId,
  questionScrollAreaRef,
  answerScrollAreaRef,
  setCurrentTabThatContainsOrder,
}: OrderSelectProps) => {
  return (
    <div
      className={cn(
        "cursor-pointer relative p-2 rounded-sm flex items-center justify-between hover:bg-foreground/10",
        currentOrderId === order?.buyerId && "!bg-[#0084ff] text-white",
        order?.verificationStatus === VERIFICATION_APPROVED &&
          "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white",

        order?.verificationStatus === VERIFICATION_PENDING &&
          "bg-yellow-600 dark:hover:bg-yellow-600 hover:bg-yellow-600 text-white",
        order?.verificationStatus === VERIFICATION_FAILED &&
          "bg-red-600 dark:hover:bg-red-600 hover:bg-red-600 text-white"
      )}
      onClick={() => {
        setCurrentOrderId(order?.buyerId);
        questionScrollAreaRef.current?.scrollTo({
          top: 0,
          behavior: "instant",
        });
        answerScrollAreaRef.current?.scrollTo({
          top: 0,
          behavior: "instant",
        });

        setCurrentTabThatContainsOrder(currentTab);
      }}
    >
      <p>
        {order.buyerName}-{order.buyerId}
      </p>
    </div>
  );
};

const OnlineTicketManagement = ({
  salesInfo,
  isSalesInfoError,
  isOnlineCoordinator,
  isRefetchingSales,
  isSalesInfoFetching,
  onlineTicketInfo,
  isOnlineTicketManagementOpen,
  setIsOnlineTicketManagementOpen,
  onRefetchSales,
}: OnlineManagementProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentTabThatContainsOrder, setCurrentTabThatContainsOrder] =
    useState(0);
  const [currentBuyerId, setCurrentBuyerId] = useState<string | undefined>(
    undefined
  );
  const [searchInput, setSearchInput] = useState("");
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);

  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const partitionedOrderData = useMemo(() => {
    const chunkedData: OnlineSalesInfo[][] = [];
    let currentChunks: OnlineSalesInfo[] = [];
    const chunkSize = 50;
    salesInfo?.forEach((item: OnlineSalesInfo) => {
      if (currentChunks.length === chunkSize) {
        chunkedData.push(currentChunks);
        currentChunks = [];
      }
      currentChunks.push(item);
    });
    chunkedData.push(currentChunks);

    return chunkedData;
  }, [salesInfo]);
  const currentOrderIndex = useMemo(() => {
    return (
      partitionedOrderData?.[currentTabThatContainsOrder]?.findIndex(
        (question) => question.buyerId === currentBuyerId
      ) ?? 0
    );
  }, [partitionedOrderData, currentTabThatContainsOrder, currentBuyerId]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const currentOrderData = useMemo(() => {
    return partitionedOrderData?.[currentTabThatContainsOrder]?.[
      currentOrderIndex
    ];
  }, [partitionedOrderData, currentTabThatContainsOrder, currentOrderIndex]);
  useEffect(() => {
    setSearchInput("");
  }, [partitionedOrderData]);

  const allOrders = useMemo(() => {
    return partitionedOrderData?.flat() ?? [];
  }, [partitionedOrderData]);

  const searchResults = useMemo(() => {
    return searchInput.length > 0
      ? allOrders.filter((order) => {
          return fuzzySearch(
            searchInput,
            `${order.buyerName}-${order.buyerId}`
          );
        })
      : [];
  }, [searchInput, allOrders]);

  const isMobile = useIsMobile();
  useEffect(() => {
    if (isMobile) {
      setIsInspectSidebarOpen(false);
    }
  }, [isMobile, setIsInspectSidebarOpen]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOnlineTicketManagementOpen.isOpen) {
      timeout = setTimeout(() => {
        if (isMobile && isInspectSidebarOpen) {
          setIsVirtualizationReady(true);
        } else if (!isMobile) {
          setIsVirtualizationReady(true);
        } else if (isMobile && !isInspectSidebarOpen) {
          setIsVirtualizationReady(false);
          setIsOnlineTicketManagementOpen({
            isOpen: true,
            buyerId:
              currentBuyerId ?? partitionedOrderData?.[0]?.[0]?.buyerId ?? "",
          });
        }
      }, 0);
    } else {
      setIsVirtualizationReady(false);
    }
    return () => clearTimeout(timeout);
  }, [
    isOnlineTicketManagementOpen.isOpen,
    isInspectSidebarOpen,
    isMobile,
    isOnlineTicketManagementOpen.buyerId,
    setIsOnlineTicketManagementOpen,
    currentOrderIndex,
    partitionedOrderData,
    currentBuyerId,
  ]);

  useEffect(() => {
    questionScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    answerScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentOrderIndex]);

  const searchVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => listScrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });
  const virtualSearchItems = searchVirtualizer.getVirtualItems();

  const displayVirtualizer = useVirtualizer({
    count: partitionedOrderData?.[currentTab]?.length ?? 0,
    getScrollElement: () => listScrollAreaRef.current,
    estimateSize: () => 65,
    enabled: isVirtualizationReady,
  });

  const scrollToQuestion = useCallback(
    ({ questionId, tab }: { questionId: string; tab: number }) => {
      if (
        !partitionedOrderData ||
        !partitionedOrderData[tab] ||
        partitionedOrderData[tab].length === 0 ||
        !isVirtualizationReady
      ) {
        return;
      }
      const itemIndex =
        partitionedOrderData[tab].findIndex(
          (question) => question.buyerId === questionId
        ) ?? 0;
      if (itemIndex === -1) {
        return;
      }

      displayVirtualizer.scrollToIndex(itemIndex);
    },
    [displayVirtualizer, partitionedOrderData, isVirtualizationReady]
  );

  const ultilityRef = useRef<HTMLDivElement | null>(null);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] =
    useState(false);
  const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] =
    useState(false);
  const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);

  const overflowScrollHandler = useCallback(() => {
    const isOverScrollingResult = isOverScrolling({
      child: ultilityRef.current,
      parent: sideBarInsetRef.current,
      specialLeftCase: !isMobile,
    });
    setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
    setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener("resize", overflowScrollHandler);

    return () => {
      window.removeEventListener("resize", overflowScrollHandler);
    };
  }, [overflowScrollHandler]);

  // Hydrate inspector on open
  useEffect(() => {
    if (!isOnlineTicketManagementOpen.isOpen) {
      return;
    }
    overflowScrollHandler();

    const tab = isOnlineTicketManagementOpen.buyerId
      ? partitionedOrderData?.findIndex((partition) =>
          partition.some(
            (question) =>
              question.buyerId === isOnlineTicketManagementOpen.buyerId
          )
        ) ?? 0
      : 0;
    setCurrentTabThatContainsOrder(tab);
    setCurrentTab(tab);
    setCurrentBuyerId(
      !isOnlineTicketManagementOpen.buyerId
        ? partitionedOrderData?.[tab]?.[0]?.buyerId
        : isOnlineTicketManagementOpen.buyerId
    );

    if (partitionedOrderData?.[tab] && isVirtualizationReady) {
      scrollToQuestion({
        questionId: isOnlineTicketManagementOpen.buyerId,
        tab,
      });
    }
  }, [
    isOnlineTicketManagementOpen,
    isVirtualizationReady,
    overflowScrollHandler,
    partitionedOrderData,
    scrollToQuestion,
  ]);

  const virtualDisplayItems = displayVirtualizer.getVirtualItems();
  const listScrollAreaRef = useRef<HTMLDivElement>(null);
  const answerScrollAreaRef = useRef<HTMLDivElement>(null);
  const questionScrollAreaRef = useRef<HTMLDivElement>(null);

  const handleNextQuestion = useCallback(() => {
    if (
      partitionedOrderData &&
      currentTabThatContainsOrder > -1 &&
      partitionedOrderData[currentTabThatContainsOrder]
    ) {
      if (searchInput === "") {
        if (
          currentOrderIndex <
          partitionedOrderData[currentTabThatContainsOrder].length - 1
        ) {
          setCurrentBuyerId(
            partitionedOrderData[currentTabThatContainsOrder][
              currentOrderIndex + 1
            ].buyerId
          );
          setCurrentTab(currentTabThatContainsOrder);
          scrollToQuestion({
            questionId:
              partitionedOrderData[currentTabThatContainsOrder][
                currentOrderIndex + 1
              ].buyerId,
            tab: currentTabThatContainsOrder,
          });
        } else {
          if (currentTabThatContainsOrder < partitionedOrderData.length - 1) {
            setCurrentTab(currentTabThatContainsOrder + 1);
            setCurrentTabThatContainsOrder(currentTabThatContainsOrder + 1);
            setCurrentBuyerId(
              partitionedOrderData[currentTabThatContainsOrder + 1][0].buyerId
            );
            listScrollAreaRef.current?.scrollTo({
              top: 0,
              behavior: "instant",
            });
          }
        }
      } else {
        const currentQuestionIndexInSearchResult = searchResults.findIndex(
          (question) => question.buyerId === currentBuyerId
        );
        if (currentQuestionIndexInSearchResult === -1) {
          return;
        }
        if (currentQuestionIndexInSearchResult < searchResults.length - 1) {
          setCurrentBuyerId(
            searchResults[currentQuestionIndexInSearchResult + 1].buyerId
          );
          const newTabIndex = partitionedOrderData?.findIndex((partition) =>
            partition.some(
              (q) =>
                q.buyerId ===
                searchResults[currentQuestionIndexInSearchResult + 1].buyerId
            )
          );
          if (newTabIndex > -1) {
            setCurrentTabThatContainsOrder(newTabIndex);
          }
          searchVirtualizer.scrollToIndex(
            currentQuestionIndexInSearchResult + 1
          );
        }
      }
    }
  }, [
    currentBuyerId,
    currentOrderIndex,
    currentTabThatContainsOrder,
    partitionedOrderData,
    scrollToQuestion,
    searchInput,
    searchResults,
    searchVirtualizer,
  ]);
  const handlePreviousQuestion = useCallback(() => {
    if (partitionedOrderData) {
      if (searchInput === "") {
        if (currentOrderIndex > 0) {
          setCurrentBuyerId(
            partitionedOrderData[currentTabThatContainsOrder][
              currentOrderIndex - 1
            ].buyerId
          );
          setCurrentTab(currentTabThatContainsOrder);
          scrollToQuestion({
            questionId:
              partitionedOrderData[currentTabThatContainsOrder][
                currentOrderIndex - 1
              ].buyerId,
            tab: currentTabThatContainsOrder,
          });
        } else {
          if (currentTabThatContainsOrder > 0) {
            setCurrentTab(currentTabThatContainsOrder - 1);
            setCurrentTabThatContainsOrder(currentTabThatContainsOrder - 1);
            setCurrentBuyerId(
              partitionedOrderData[currentTabThatContainsOrder - 1][
                partitionedOrderData[currentTabThatContainsOrder - 1].length - 1
              ].buyerId
            );
            setTimeout(() => {
              scrollToQuestion({
                questionId:
                  partitionedOrderData[currentTabThatContainsOrder - 1][
                    partitionedOrderData[currentTabThatContainsOrder - 1]
                      .length - 1
                  ].buyerId,
                tab: currentTabThatContainsOrder - 1,
              });
            }, 0);
          }
        }
      } else {
        const currentQuestionIndexInSearchResult = searchResults.findIndex(
          (question) => question.buyerId === currentBuyerId
        );
        if (currentQuestionIndexInSearchResult === -1) {
          return;
        }
        if (currentQuestionIndexInSearchResult > 0) {
          setCurrentBuyerId(
            searchResults[currentQuestionIndexInSearchResult - 1].buyerId
          );
          const newTabIndex = partitionedOrderData?.findIndex((partition) =>
            partition.some(
              (q) =>
                q.buyerId ===
                searchResults[currentQuestionIndexInSearchResult - 1].buyerId
            )
          );
          if (newTabIndex > -1) {
            setCurrentTabThatContainsOrder(newTabIndex);
          }
          searchVirtualizer.scrollToIndex(
            currentQuestionIndexInSearchResult - 1
          );
        }
      }
    }
  }, [
    currentBuyerId,
    currentOrderIndex,
    currentTabThatContainsOrder,
    partitionedOrderData,
    scrollToQuestion,
    searchInput,
    searchResults,
    searchVirtualizer,
  ]);

  const isHandleNextQuestionDisabled = useMemo(() => {
    if (
      !partitionedOrderData ||
      currentTabThatContainsOrder < 0 ||
      !partitionedOrderData[currentTabThatContainsOrder]
    ) {
      return true;
    }
    if (searchInput === "") {
      return (
        currentOrderIndex ===
          partitionedOrderData[currentTabThatContainsOrder].length - 1 &&
        currentTabThatContainsOrder === partitionedOrderData.length - 1
      );
    } else {
      const currentQuestionIndexInSearchResult = searchResults.findIndex(
        (question) => question.buyerId === currentBuyerId
      );
      if (currentQuestionIndexInSearchResult === -1) {
        return true;
      }
      if (currentQuestionIndexInSearchResult === searchResults.length - 1) {
        return true;
      }
    }
    return false;
  }, [
    partitionedOrderData,
    searchInput,
    currentOrderIndex,
    currentTabThatContainsOrder,
    searchResults,
    currentBuyerId,
  ]);
  const isHandlePreviousQuestionDisabled = useMemo(() => {
    if (
      !partitionedOrderData ||
      currentTabThatContainsOrder < 0 ||
      !partitionedOrderData[currentTabThatContainsOrder]
    ) {
      return true;
    }
    if (searchInput === "") {
      return currentOrderIndex === 0 && currentTabThatContainsOrder === 0;
    } else {
      const currentQuestionIndexInSearchResult = searchResults.findIndex(
        (question) => question.buyerId === currentBuyerId
      );
      if (currentQuestionIndexInSearchResult === -1) {
        return true;
      }
      if (currentQuestionIndexInSearchResult === 0) {
        return true;
      }
    }
    return false;
  }, [
    partitionedOrderData,
    searchInput,
    currentOrderIndex,
    currentTabThatContainsOrder,
    searchResults,
    currentBuyerId,
  ]);
  const [isCoolDown, setIsCoolDown] = useState(false);

  useEffect(() => {
    if (isOnlineTicketManagementOpen.isOpen) {
    } else {
      setIsInputFocused(false);
    }
  }, [isOnlineTicketManagementOpen.isOpen]);

  return (
    <>
      <Dialog
        open={isOnlineTicketManagementOpen.isOpen}
        onOpenChange={(open) => {
          setIsOnlineTicketManagementOpen({
            isOpen: open,
            buyerId: currentBuyerId ?? "",
          });
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                className="cursor-pointer w-[35px] !bg-[#F48120] !text-white"
                disabled={!salesInfo || isSalesInfoError}
                variant="outline"
              >
                <Box />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent
            className="!bg-[#F48120] !text-white "
            arrowClassName="fill-[#F48120] bg-[#F48120]"
          >
            Kiểm soát vé online
          </TooltipContent>
        </Tooltip>
        <DialogContent
          className="h-[95vh] flex flex-col justify-between overflow-hidden !py-2 !max-w-[100vw] w-[90vw]"
          onKeyDown={(e) => {
            if (e.key === "e" && !isInputFocused) {
              e.preventDefault();
            }
            if (isCoolDown) return;

            if (
              (e.key === "ArrowUp" ||
                ((e.key === "w" || e.key === "a" || e.key === "ArrowLeft") &&
                  !isInputFocused)) &&
              !isHandlePreviousQuestionDisabled
            ) {
              e.preventDefault();
              handlePreviousQuestion();
              setIsCoolDown(true);
              setTimeout(() => {
                setIsCoolDown(false);
              }, 25);
            } else if (
              (e.key === "ArrowDown" ||
                ((e.key === "s" || e.key === "d" || e.key === "ArrowRight") &&
                  !isInputFocused)) &&
              !isHandleNextQuestionDisabled
            ) {
              e.preventDefault();
              handleNextQuestion();

              setIsCoolDown(true);
              setTimeout(() => {
                setIsCoolDown(false);
              }, 25);
            }
          }}
          onKeyUp={() => {
            setIsCoolDown(false);
          }}
        >
          <DialogTitle className="sr-only">Kiểm soát vé online</DialogTitle>
          <DialogDescription className="sr-only">
            Kiểm soát vé online
          </DialogDescription>

          {isOnlineCoordinator ? (
            <SidebarProvider
              onOpenChange={setIsInspectSidebarOpen}
              openMobile={isInspectSidebarOpen}
              onOpenChangeMobile={setIsInspectSidebarOpen}
              open={isInspectSidebarOpen}
              className="!min-h-[inherit]"
              style={
                {
                  "--sidebar-width": "299.6px",
                  height: "inherit",
                  minHeight: "inherit !important",
                } as React.CSSProperties
              }
            >
              <Sidebar
                className="top-0 !h-full"
                onTransitionEnd={(e) => {
                  if (e.propertyName == "left") {
                    overflowScrollHandler();
                  }
                }}
              >
                <SidebarHeader className="sr-only">Tìm học sinh</SidebarHeader>
                <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 !overflow-hidden">
                  <FinishedTracker allOrders={allOrders} />
                  <div className="flex items-center justify-start w-full gap-2 px-1 mt-5">
                    <div className="flex items-center gap-2 border-b border-border">
                      <Search />
                      <Input
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-accent placeholder:text-sm"
                        placeholder="Tìm học sinh"
                        value={searchInput}
                        tabIndex={-1}
                        onChange={(e) => {
                          if (searchInput == "") {
                            listScrollAreaRef.current?.scrollTo({
                              top: 0,
                            });
                          }
                          setSearchInput(e.target.value);
                          if (e.target.value.length === 0 && currentBuyerId) {
                            setCurrentTab(currentTabThatContainsOrder);
                            setTimeout(() => {
                              scrollToQuestion({
                                questionId: currentBuyerId,
                                tab: currentTabThatContainsOrder,
                              });
                            }, 0);
                          }
                        }}
                      />
                      {searchInput.length > 0 && (
                        <X
                          className="text-red-600 hover:text-red-600/80 cursor-pointer"
                          onClick={() => {
                            setSearchInput("");
                            setCurrentTab(currentTabThatContainsOrder);
                            if (currentBuyerId) {
                              setTimeout(() => {
                                scrollToQuestion({
                                  questionId: currentBuyerId,
                                  tab: currentTabThatContainsOrder,
                                });
                              }, 0);
                            }
                          }}
                        />
                      )}
                    </div>
                    <Button
                      variant="default"
                      className="cursor-pointer rounded-[3px] flex items-center justify-center gap-1"
                      title="Go to current question"
                      onClick={() => {
                        if (searchInput === "") {
                          setCurrentTab(currentTabThatContainsOrder);
                          if (currentBuyerId) {
                            setTimeout(() => {
                              scrollToQuestion({
                                questionId: currentBuyerId,
                                tab: currentTabThatContainsOrder,
                              });
                            }, 0);
                          }
                        } else {
                          const currentQuestionIndexInSearchResult =
                            searchResults.findIndex(
                              (question) => question.buyerId === currentBuyerId
                            );
                          if (currentQuestionIndexInSearchResult === -1) {
                            return;
                          }
                          setTimeout(() => {
                            searchVirtualizer.scrollToIndex(
                              currentQuestionIndexInSearchResult
                            );
                          }, 0);
                        }
                      }}
                    >
                      <FastForward />
                      Current
                    </Button>
                  </div>
                  <ScrollArea
                    className={cn(
                      "w-full",
                      searchInput.length > 0 ? "h-[90%]" : "h-[80%] "
                    )}
                    type="always"
                    viewportRef={listScrollAreaRef}
                  >
                    <div
                      className={cn(
                        "relative w-full",
                        searchInput.length > 0 && "!hidden"
                      )}
                      style={{
                        height: displayVirtualizer.getTotalSize(),
                      }}
                    >
                      {virtualDisplayItems.map((virtualItem) => (
                        <div
                          className="absolute top-0 left-0 w-full pr-3"
                          style={{
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                          key={virtualItem.key}
                          data-index={virtualItem.index}
                        >
                          {partitionedOrderData?.[currentTab][
                            virtualItem.index
                          ] && (
                            <Fragment key={virtualItem.index}>
                              <OrderSelect
                                order={
                                  partitionedOrderData[currentTab][
                                    virtualItem.index
                                  ]
                                }
                                currentTab={currentTab}
                                currentOrderId={currentBuyerId}
                                setCurrentOrderId={setCurrentBuyerId}
                                questionScrollAreaRef={questionScrollAreaRef}
                                answerScrollAreaRef={answerScrollAreaRef}
                                setCurrentTabThatContainsOrder={
                                  setCurrentTabThatContainsOrder
                                }
                                isInspectSidebarOpen={isInspectSidebarOpen}
                              />
                              <Separator />
                            </Fragment>
                          )}
                        </div>
                      ))}
                    </div>
                    <div
                      className="relative w-full"
                      style={{
                        height: searchVirtualizer.getTotalSize(),
                      }}
                    >
                      {virtualSearchItems.map((virtualItem) => (
                        <div
                          className="absolute top-0 left-0 w-full pr-3"
                          style={{
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                          key={virtualItem.key}
                          data-index={virtualItem.index}
                        >
                          <Fragment key={virtualItem.index}>
                            <OrderSelect
                              order={searchResults[virtualItem.index]}
                              currentTab={
                                partitionedOrderData?.findIndex((tab) =>
                                  tab.some(
                                    (question) =>
                                      question.buyerId ===
                                      searchResults[virtualItem.index]?.buyerId
                                  )
                                ) ?? 0
                              }
                              currentOrderId={currentBuyerId}
                              questionScrollAreaRef={questionScrollAreaRef}
                              answerScrollAreaRef={answerScrollAreaRef}
                              setCurrentTabThatContainsOrder={
                                setCurrentTabThatContainsOrder
                              }
                              setCurrentOrderId={setCurrentBuyerId}
                              isInspectSidebarOpen={isInspectSidebarOpen}
                            />
                            <Separator />
                          </Fragment>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div
                    className={cn(
                      "flex justify-between items-center w-full",
                      searchInput.length > 0 && "hidden"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        title="Jump to first tab"
                        disabled={currentTab === 0}
                        onClick={() => {
                          setCurrentTab(0);
                          if (
                            currentTabThatContainsOrder == 0 &&
                            currentBuyerId
                          ) {
                            scrollToQuestion({
                              questionId: currentBuyerId,
                              tab: 0,
                            });
                          } else {
                            listScrollAreaRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }}
                        variant="outline"
                        className="w-9 h-9 cursor-pointer rounded-[2px]"
                      >
                        <ChevronsLeft />
                      </Button>
                      <Button
                        title="Jump to previous tab"
                        disabled={currentTab === 0}
                        onClick={() => {
                          if (
                            currentTab > 0 &&
                            currentTab < (partitionedOrderData?.length ?? 0)
                          ) {
                            setCurrentTab(currentTab - 1);
                          }
                          if (
                            currentTabThatContainsOrder == currentTab - 1 &&
                            currentBuyerId
                          ) {
                            scrollToQuestion({
                              questionId: currentBuyerId,
                              tab: currentTab - 1,
                            });
                          } else {
                            listScrollAreaRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }}
                        variant="outline"
                        className="w-9 h-9 cursor-pointer rounded-[2px]"
                      >
                        <ChevronLeft />
                      </Button>
                    </div>
                    <JumpToTabButton
                      tab={currentTab}
                      onTabChangeCallback={({ tab }) => {
                        setCurrentTab(tab);
                        listScrollAreaRef.current?.scrollTo({
                          top: 0,
                          behavior: "instant",
                        });
                      }}
                      totalTabs={partitionedOrderData?.length ?? 0}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        title="Jump to next tab"
                        disabled={
                          currentTab === (partitionedOrderData?.length ?? 1) - 1
                        }
                        onClick={() => {
                          if (
                            currentTab <
                            (partitionedOrderData?.length ?? 0) - 1
                          ) {
                            setCurrentTab(currentTab + 1);
                          }
                          if (
                            currentTabThatContainsOrder == currentTab + 1 &&
                            currentBuyerId
                          ) {
                            scrollToQuestion({
                              questionId: currentBuyerId,
                              tab: currentTab + 1,
                            });
                          } else {
                            listScrollAreaRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }}
                        variant="outline"
                        className="w-9 h-9 cursor-pointer rounded-[2px]"
                      >
                        <ChevronRight />
                      </Button>
                      <Button
                        title="Jump to last tab"
                        disabled={
                          currentTab === (partitionedOrderData?.length ?? 1) - 1
                        }
                        onClick={() => {
                          setCurrentTab(
                            (partitionedOrderData?.length ?? 1) - 1
                          );
                          if (
                            currentTabThatContainsOrder ==
                              (partitionedOrderData?.length ?? 1) - 1 &&
                            currentBuyerId
                          ) {
                            scrollToQuestion({
                              questionId: currentBuyerId,
                              tab: (partitionedOrderData?.length ?? 1) - 1,
                            });
                          } else {
                            listScrollAreaRef.current?.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }}
                        variant="outline"
                        className="w-9 h-9 cursor-pointer rounded-[2px]"
                      >
                        <ChevronsRight />
                      </Button>
                    </div>
                  </div>
                </SidebarContent>
                <SidebarRail />
              </Sidebar>
              <SidebarInset className="h-[inherit] w-full p-2 pt-0 rounded-md px-4 dark:bg-accent gap-2 overflow-hidden flex flex-col items-center justify-between">
                <div
                  className="w-full flex flex-col gap-2 items-center justify-start relative"
                  ref={sideBarInsetRef}
                >
                  {isUltilityOverflowingRight && (
                    <Button
                      className="absolute right-0 top-1  rounded-full cursor-pointer w-7 h-7 z-[200]"
                      title="Move right"
                      onClick={() => {
                        if (ultilityHorizontalScrollBarRef.current) {
                          ultilityHorizontalScrollBarRef.current.scrollBy({
                            left: 200,
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      <ChevronRight size={5} />
                    </Button>
                  )}
                  {isUltilityOverflowingLeft && (
                    <Button
                      className="absolute left-0 top-1 rounded-full cursor-pointer w-7 h-7 z-[200]"
                      title="Move left"
                      onClick={() => {
                        if (ultilityHorizontalScrollBarRef.current) {
                          ultilityHorizontalScrollBarRef.current.scrollBy({
                            left: -200,
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      <ChevronLeft size={5} />
                    </Button>
                  )}
                  <ScrollArea
                    className="w-full whitespace-nowrap"
                    viewPortOnScroll={overflowScrollHandler}
                    viewportRef={ultilityHorizontalScrollBarRef}
                  >
                    <div
                      className="flex pt-1 items-center w-max justify-center gap-4 mb-2 relative"
                      ref={ultilityRef}
                    >
                      <h3 className="text-center font-semibold text-xl uppercase">
                        Kiểm soát vé online
                      </h3>
                      <Separator
                        orientation="vertical"
                        className="!h-[30px] !w-[2px]"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          className="w-9 rounded-sm cursor-pointer"
                          onClick={handleNextQuestion}
                          title="Order sau"
                          disabled={isHandleNextQuestionDisabled}
                        >
                          <ChevronDown />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-9 rounded-sm cursor-pointer"
                          onClick={handlePreviousQuestion}
                          title="Order trước"
                          disabled={isHandlePreviousQuestionDisabled}
                        >
                          <ChevronUp />
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() =>
                          setIsInspectSidebarOpen(!isInspectSidebarOpen)
                        }
                      >
                        {isInspectSidebarOpen ? "Hide" : "Show"}
                        <PanelsTopLeft />
                      </Button>

                      <Button
                        onClick={() => onRefetchSales()}
                        variant="ghost"
                        className="border border-black cursor-pointer"
                        disabled={
                          isRefetchingSales ||
                          isSalesInfoFetching ||
                          !isOnlineCoordinator
                        }
                      >
                        Cập nhật dữ liệu
                        {(isRefetchingSales || isSalesInfoFetching) && (
                          <Loader2 className="animate-spin " />
                        )}
                      </Button>
                    </div>

                    <ScrollBar
                      orientation="horizontal"
                      className="[&_.bg-border]:bg-transparent"
                    />
                  </ScrollArea>

                  <ScrollArea
                    className="h-[75dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-4"
                    type="always"
                  >
                    <div className="w-full h-full flex-wrap gap-4 flex items-start justify-center">
                      <div
                        className={cn(
                          "flex-7 min-w-[290px] h-full border border-black rounded-lg flex flex-col gap-2 items-center justify-center p-2",
                          currentOrderData?.verificationStatus ===
                            VERIFICATION_APPROVED &&
                            "border-green-600 text-green-600 [&_*]:text-green-600",
                          currentOrderData?.verificationStatus ===
                            VERIFICATION_FAILED &&
                            "border-red-600 text-red-600 [&_*]:text-red-600"
                        )}
                      >
                        <h4 className="text-md text-center">
                          Màn hình chuyển khoản
                        </h4>
                        <ScrollArea
                          className="h-[70dvh] max-h-[420px] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                          type="always"
                          viewportRef={answerScrollAreaRef}
                        >
                          <InspectOrderImages
                            imageSource={currentOrderData?.proofOfPaymentImage}
                            currentBuyerId={currentOrderData?.buyerId}
                          />
                        </ScrollArea>
                      </div>

                      <div className="flex w-[290px] flex-5 flex-col gap-2">
                        {currentOrderData?.verificationStatus ===
                          VERIFICATION_APPROVED && (
                          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg mb-2">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold text-sm">
                                Xác minh thành công!
                              </span>
                            </div>
                          </div>
                        )}
                        {currentOrderData?.verificationStatus ===
                          VERIFICATION_FAILED && (
                          <div className="flex flex-col p-4 bg-red-50 border border-red-200 rounded-lg mb-2">
                            <div className="flex flex-col w-full items-center justify-center gap-2 text-red-700 mb-2">
                              <div className="flex items-center gap-2 w-full justify-center">
                                <XCircle className="w-5 h-5" />
                                <span className="font-semibold text-sm">
                                  Đơn hàng đã bị từ chối!
                                </span>
                              </div>
                              {currentOrderData?.rejectionReason && (
                                <p className="text-xs text-red-700 mt-1 text-left w-full break-words">
                                  <span className="font-bold">Lý do:</span>{" "}
                                  {currentOrderData.rejectionReason}
                                </p>
                              )}
                              <Button
                                variant="outline"
                                className="w-full cursor-pointer hover:text-red-700"
                              >
                                Xác minh lại đơn hàng
                              </Button>
                            </div>
                          </div>
                        )}
                        {currentOrderData?.verificationStatus ===
                          VERIFICATION_PENDING && (
                          <div className="flex items-center justify-center p-4 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                            <div className="flex w-full flex-col items-center gap-3 text-amber-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold text-sm">
                                  Đang chờ xác minh...
                                </span>
                              </div>
                              <div className="flex w-full items-center justify-center gap-2">
                                <Button
                                  className="w-1/2 cursor-pointer hover:text-amber-700"
                                  variant="outline"
                                >
                                  Đồng ý
                                </Button>
                                <Button
                                  className="w-1/2 cursor-pointer"
                                  variant="destructive"
                                >
                                  Từ chối
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div
                          className={cn(
                            "w-full border rounded-lg flex  flex-col gap-2 p-4",
                            currentOrderData?.verificationStatus ===
                              VERIFICATION_APPROVED &&
                              "border-green-600 text-green-600 [&_*]:text-green-600",
                            currentOrderData?.verificationStatus ===
                              VERIFICATION_FAILED &&
                              "border-red-600 text-red-600 [&_*]:text-red-600"
                          )}
                        >
                          <h4 className="text-md text-center -mt-2">
                            Thông tin người mua
                          </h4>
                          <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                            <p className="font-bold text-gray-900">
                              Ngày đặt hàng:
                            </p>
                            <p className="break-words max-w-full">
                              {currentOrderData?.time}
                            </p>
                          </div>
                          <Separator />
                          <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                            <p className="font-bold text-gray-900">Hạng vé:</p>
                            <p className="break-words max-w-full">
                              {currentOrderData?.buyerTicketType}
                            </p>
                          </div>
                          <Separator />
                          <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                            <p className="font-bold text-gray-900">Giá vé:</p>
                            <p className="break-words max-w-full">
                              {
                                onlineTicketInfo?.find(
                                  (ticket) =>
                                    ticket.ticketName ===
                                    currentOrderData?.buyerTicketType
                                )?.price
                              }
                            </p>
                          </div>
                          <Separator />

                          <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                            <p className="font-bold text-gray-900">
                              Họ và tên:
                            </p>
                            <p className="break-words max-w-full">
                              {currentOrderData?.buyerName}
                            </p>
                          </div>
                          <Separator />
                          <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                            <p className="font-bold text-gray-900">
                              Mã số học sinh:
                            </p>
                            <p className="break-words max-w-full">
                              {currentOrderData?.buyerId}
                            </p>
                          </div>
                          <Separator />
                          <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                            <p className="font-bold text-gray-900">Lớp:</p>
                            <p className="break-words max-w-full">
                              {currentOrderData?.buyerClass}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
                <Button
                  className="w-full h-7 my-4 flex items-center justify-center cursor-pointer "
                  onClick={() => {
                    if (currentBuyerId) {
                      setIsOnlineTicketManagementOpen({
                        isOpen: false,
                        buyerId: currentBuyerId,
                      });
                    }
                  }}
                >
                  Đóng
                </Button>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <div className="flex items-center flex-col h-full justify-center gap-4">
              <div className="flex items-center flex-col h-full justify-center gap-4">
                <ShieldBan
                  size={75}
                  className="text-red-500"
                  strokeWidth={1.6}
                />
                <h3 className="text-center font-semibold text-xl text-red-500 uppercase">
                  Xin lỗi, bạn không phải là coordinator bán vé online, bạn
                  không có quyền truy cập!
                </h3>
              </div>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => {
                  setIsOnlineTicketManagementOpen({
                    isOpen: false,
                    buyerId: currentBuyerId ?? "",
                  });
                }}
              >
                Đóng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={
          (isRefetchingSales || isSalesInfoFetching) &&
          isOnlineTicketManagementOpen.isOpen
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Vui lòng chờ trong giây lát...
            </AlertDialogTitle>
          </AlertDialogHeader>
          <Loader loadingText="Đang cập nhật dữ liệu..." />
          <AlertDialogDescription className="sr-only">
            Vui lòng chờ trong giây lát...
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OnlineTicketManagement;

const FinishedTracker = ({ allOrders }: { allOrders: OnlineSalesInfo[] }) => {
  return (
    <div className="absolute w-full h-7 bg-green-600 left-0 top-0 flex items-center justify-center text-white text-sm">
      <>
        {
          allOrders.filter(
            (o) => o.verificationStatus === VERIFICATION_STATUS.SUCCESS
          ).length
        }{" "}
        đơn hàng thành công trên tổng {allOrders.length}
      </>
    </div>
  );
};

/* eslint-disable @next/next/no-img-element */

export const InspectOrderImages = ({
  imageSource,
  currentBuyerId,
}: {
  imageSource: string | undefined;
  currentBuyerId: string | undefined;
}) => {
  if (!imageSource || imageSource.length === 0) {
    return <p className="text-center text-red-600">Unable to fetch resource</p>;
  }
  return (
    <div className="flex flex-col flex-wrap w-full relative items-center">
      <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0" />
      {imageSource && (
        <Fragment key={`${imageSource}${currentBuyerId}`}>
          <img
            className="w-full h-full object-contain relative z-10 !max-w-[750px] bg-white"
            src={imageSource}
            alt="Order image"
            loading="lazy"
          />
        </Fragment>
      )}
    </div>
  );
};
