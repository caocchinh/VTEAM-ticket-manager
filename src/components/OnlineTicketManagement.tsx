import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Dispatch,
  SetStateAction,
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  FastForward,
  Loader2,
  PanelsTopLeft,
  Search,
  ShieldBan,
  X,
} from "lucide-react";
import { OnlineSalesInfo, OrderSelectProps } from "@/constants/types";
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
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { JumpToTabButton } from "./JumpToTabButton";
import { VERIFICATION_APPROVED } from "@/constants/constants";

const OrderSelect = ({
  order,
  allOrders,
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
        allOrders?.some(
          (item) =>
            item.buyerId === order?.buyerId &&
            item.verificationStatus === VERIFICATION_APPROVED
        ) &&
          "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white"
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
  isOnlineTicketManagementOpen,
  setIsOnlineTicketManagementOpen,
  onRefetchSales,
}: {
  salesInfo: OnlineSalesInfo[] | undefined;
  isOnlineCoordinator: boolean;
  isSalesInfoError: boolean;
  isRefetchingSales: boolean;
  isSalesInfoFetching: boolean;
  onRefetchSales: () => void;
  isOnlineTicketManagementOpen: {
    isOpen: boolean;
    buyerId: string;
  };
  setIsOnlineTicketManagementOpen: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      buyerId: string;
    }>
  >;
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentTabThatContainsOrder, setCurrentTabThatContainsOrder] =
    useState(0);
  const [currentBuyerId, setCurrentBuyerId] = useState<string | undefined>(
    undefined
  );
  const [searchInput, setSearchInput] = useState("");
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);

  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(false);
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

  useEffect(() => {
    setIsOnlineTicketManagementOpen((prev) => {
      return {
        ...prev,
        buyerId: currentBuyerId ?? prev.buyerId,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsOnlineTicketManagementOpen]);

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
    isOnlineTicketManagementOpen.buyerId,
    isOnlineTicketManagementOpen.isOpen,
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
    <Dialog
      open={isOnlineTicketManagementOpen.isOpen}
      onOpenChange={(open) =>
        setIsOnlineTicketManagementOpen({
          isOpen: open,
          buyerId: isOnlineTicketManagementOpen.buyerId,
        })
      }
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
              <SidebarHeader className="sr-only">
                Search questions
              </SidebarHeader>
              <SidebarContent className="dark:bg-accent flex flex-col gap-2 h-full justify-between items-center border-r border-border p-3 pr-1 !overflow-hidden">
                <FinishedTracker allOrders={allOrders} />
                <div className="flex items-center justify-start w-full gap-2 px-1 mt-5">
                  <div className="flex items-center gap-2 border-b border-border">
                    <Search />
                    <Input
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-accent placeholder:text-sm"
                      placeholder="Search questions"
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
                              allOrders={allOrders}
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
                            allOrders={allOrders}
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
                        setCurrentTab((partitionedOrderData?.length ?? 1) - 1);
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
                className="w-full h-[inherit] flex flex-col gap-2 items-center justify-start relative"
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
                        title="Next question"
                        disabled={isHandleNextQuestionDisabled}
                      >
                        <ChevronDown />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-9 rounded-sm cursor-pointer"
                        onClick={handlePreviousQuestion}
                        title="Previous question"
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
                      {isRefetchingSales && (
                        <Loader2 className="animate-spin " />
                      )}
                    </Button>
                  </div>

                  <ScrollBar
                    orientation="horizontal"
                    className="[&_.bg-border]:bg-transparent"
                  />
                </ScrollArea>

                <div>
                  <ScrollArea
                    className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                    type="always"
                    viewportRef={answerScrollAreaRef}
                  >
                    <InspectOrderImages
                      imageSource={currentOrderData?.proofOfPaymentImage}
                      currentBuyerId={currentOrderData?.buyerId}
                    />
                  </ScrollArea>
                </div>
              </div>
              <Button
                className="w-full h-7 flex items-center justify-center cursor-pointer lg:hidden "
                onClick={() => {
                  if (currentBuyerId) {
                    setIsOnlineTicketManagementOpen({
                      isOpen: false,
                      buyerId: currentBuyerId,
                    });
                  }
                }}
              >
                Close
              </Button>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          <div className="flex items-center flex-col h-max justify-center gap-4">
            <ShieldBan size={75} className="text-red-500" strokeWidth={1.6} />
            <h3 className="text-center font-semibold text-xl text-red-500 uppercase">
              Xin lỗi, bạn không phải là coordinator bán vé online, bạn không có
              quyền truy cập!
            </h3>
          </div>
        )}

        <DialogFooter className="h-max">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() =>
              setIsOnlineTicketManagementOpen((prev) => ({
                ...prev,
                isOpen: false,
              }))
            }
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnlineTicketManagement;

const FinishedTracker = ({ allOrders }: { allOrders: OnlineSalesInfo[] }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMutatingFinishedQuestion =
    useIsMutating({
      mutationKey: ["user_finished_orders"],
    }) > 0;
  const queryClient = useQueryClient();
  const userFinishedOrders: OnlineSalesInfo[] | undefined =
    queryClient.getQueryData(["user_finished_orders"]);
  return (
    <div className="absolute w-full h-7 bg-green-600 left-0 top-0 flex items-center justify-center text-white text-sm">
      <>
        {
          allOrders.filter((o) =>
            userFinishedOrders?.some((fq) => fq.buyerId === o.buyerId)
          ).length
        }{" "}
        đơn hàng thành công
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
